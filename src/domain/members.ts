import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, uuid, paging } from './validation';

const allowed = [
  'verify_captures',
  'manage_projects',
  'manage_species',
  'view_contracts',
  'manage_members',
];
async function owner(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Record<string, unknown>,
) {
  const organizationId = await service.organization(
    request,
    query.organizationId,
    true,
  );
  const result = await service.pool.query(
    'SELECT entity_id FROM stakeholder.stakeholder WHERE id=$1',
    [organizationId],
  );
  const externalId = result.rows[0]?.entity_id;
  if (!externalId)
    throw new DomainError(
      409,
      'This organization needs its approved Keycloak membership mapping',
    );
  return { organizationId, externalId };
}
export async function members(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Record<string, unknown>,
) {
  const { organizationId, externalId } = await owner(service, request, query),
    { size, offset } = paging(query);
  const { organizationMembers } =
    await import('../services/keycloakAdminService');
  const users = await organizationMembers(externalId, offset, size + 1);
  const approved = users.filter(
    (user) =>
      user.attributes?.organization_id?.length === 1 &&
      user.attributes.organization_id[0] === String(externalId),
  );
  const result = await service.pool.query(
    `SELECT keycloak_user_id,permissions,updated_at::text AS updated_at
    FROM stakeholder.organization_user WHERE organization_id=$1 AND keycloak_user_id=ANY($2::uuid[])`,
    [organizationId, approved.map((user) => user.id)],
  );
  return {
    hasNext: users.length > size,
    rows: approved.slice(0, size).map((user) => {
      const grant = result.rows.find((row) => row.keycloak_user_id === user.id);
      return {
        id: user.id,
        name:
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          user.username,
        username: user.username,
        email: user.email,
        enabled: user.enabled,
        permissions: grant?.permissions ?? ['verify_captures'],
        updated_at: grant?.updated_at ?? null,
      };
    }),
  };
}
export async function saveMember(
  service: AdminDomainService,
  request: KeycloakRequest,
  userId: string,
  body: Record<string, unknown>,
) {
  const { organizationId, externalId } = await owner(service, request, body);
  await service.requirePermission(request, organizationId, 'manage_members');
  uuid(userId, 'User');
  if (
    !Array.isArray(body.permissions) ||
    !body.permissions.every(
      (value) => typeof value === 'string' && allowed.includes(value),
    )
  ) {
    throw new DomainError(400, 'Choose valid organization permissions');
  }
  const { organizationMember } =
    await import('../services/keycloakAdminService');
  const member = await organizationMember(userId);
  if (
    !member ||
    member.user.attributes?.organization_id?.length !== 1 ||
    member.user.attributes.organization_id[0] !== String(externalId)
  ) {
    throw new DomainError(403, 'User is outside this organization');
  }
  if (member.organizationAdmin)
    throw new DomainError(
      409,
      'Organization administrators retain all organization permissions',
    );
  const permissions = [...new Set(body.permissions)];
  const client = await service.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      organizationId + ':' + userId,
    ]);
    const existing = await client.query(
      'SELECT updated_at::text AS updated_at FROM stakeholder.organization_user WHERE organization_id=$1 AND keycloak_user_id=$2 FOR UPDATE',
      [organizationId, userId],
    );
    if ((existing.rows[0]?.updated_at ?? null) !== service.version(body))
      throw new DomainError(
        409,
        'User permissions changed. Refresh before saving.',
      );
    await client.query(
      `INSERT INTO stakeholder.organization_user(organization_id,keycloak_user_id,permissions,updated_by)
      VALUES($1,$2,$3,$4) ON CONFLICT(organization_id,keycloak_user_id)
      DO UPDATE SET permissions=excluded.permissions,updated_by=excluded.updated_by,updated_at=clock_timestamp()`,
      [organizationId, userId, permissions, request.user?.id],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return { saved: true };
}
