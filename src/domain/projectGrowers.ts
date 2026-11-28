import { createHash, randomUUID } from 'crypto';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, paging, text, uuid } from './validation';
type Input = Record<string, unknown>;
async function projectScope(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  scopeValue: unknown,
) {
  const scope = await service.organization(request, scopeValue);
  const result = await service.pool.query(
    'SELECT id,organization_id,status FROM stakeholder.project WHERE id=$1 AND ($2::uuid IS NULL OR organization_id=$2)',
    [uuid(id, 'Project'), scope],
  );
  if (!result.rowCount) throw new DomainError(404, 'Project not found');
  return result.rows[0];
}
export async function projectGrowers(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  query: Input,
) {
  const project = await projectScope(
    service,
    request,
    id,
    query.organizationId,
  );
  const { size, offset } = paging(query),
    search = (text(query.search, 'Search', false, 160) || '').toLowerCase();
  const result = await service.pool.query(
    `SELECT g.id,g.image_url,g.phone,g.email,nullif(trim(concat_ws(' ',g.first_name,g.last_name)),'') AS name,
    pg.joined_at::text AS joined_at,pg.left_at::text AS left_at,(pg.project_id IS NOT NULL AND pg.left_at IS NULL) AS assigned,
    (g.organization_id=$2 OR EXISTS(SELECT 1 FROM treetracker.grower_account_org o WHERE o.grower_account_id=g.id AND o.organization_id=$2 AND o.status='active')) AS eligible
    FROM treetracker.grower_account g LEFT JOIN stakeholder.project_grower pg ON pg.grower_account_id=g.id AND pg.project_id=$1
    WHERE (pg.project_id IS NOT NULL OR g.organization_id=$2 OR EXISTS(SELECT 1 FROM treetracker.grower_account_org o WHERE o.grower_account_id=g.id AND o.organization_id=$2 AND o.status='active'))
      AND ($3='' OR strpos(lower(concat_ws(' ',g.first_name,g.last_name,g.phone,g.email,g.id::text)),$3)>0)
    ORDER BY (pg.project_id IS NOT NULL AND pg.left_at IS NULL) DESC,g.first_name,g.last_name,g.id LIMIT $4 OFFSET $5`,
    [project.id, project.organization_id, search, size + 1, offset],
  );
  return {
    rows: result.rows.slice(0, size),
    hasNext: result.rows.length > size,
  };
}
export async function projectGrowerHistory(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  query: Input,
) {
  const project = await projectScope(
    service,
    request,
    id,
    query.organizationId,
  );
  const { size, offset } = paging(query);
  const result = await service.pool.query(
    `SELECT h.*,nullif(trim(concat_ws(' ',g.first_name,g.last_name)),'') AS grower_name
    FROM stakeholder.project_grower_event h LEFT JOIN treetracker.grower_account g ON g.id=h.grower_account_id
    WHERE h.project_id=$1 ORDER BY h.created_at DESC,h.id DESC LIMIT $2 OFFSET $3`,
    [project.id, size + 1, offset],
  );
  return {
    rows: result.rows.slice(0, size),
    hasNext: result.rows.length > size,
  };
}
export async function changeProjectGrower(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  growerId: string,
  body: Input,
) {
  const project = await projectScope(service, request, id, body.organizationId);
  await service.requirePermission(
    request,
    project.organization_id,
    'manage_projects',
  );
  const grower = uuid(growerId, 'Grower'),
    actor = uuid(request.user?.id, 'Administrator'),
    requestId = uuid(body.requestId, 'Request');
  if (!['assign', 'remove'].includes(String(body.action)))
    throw new DomainError(400, 'Choose assign or remove');
  const reason = text(body.reason, 'Assignment reason', true, 1000);
  if (
    body.joined_at !== null &&
    (typeof body.joined_at !== 'string' ||
      !Number.isFinite(Date.parse(body.joined_at)))
  )
    throw new DomainError(400, 'Membership version is required');
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        project: project.id,
        grower,
        actor,
        action: body.action,
        reason,
        version: body.joined_at,
      }),
    )
    .digest('hex');
  const c = await service.pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'project-grower:' + requestId,
    ]);
    const prior = await c.query(
      'SELECT id,request_hash FROM stakeholder.project_grower_event WHERE request_id=$1 AND project_id=$2 AND grower_account_id=$3',
      [requestId, project.id, grower],
    );
    if (prior.rowCount) {
      if (prior.rows[0].request_hash !== hash)
        throw new DomainError(409, 'Request ID was already used');
      await c.query('COMMIT');
      return { id: prior.rows[0].id, replayed: true };
    }
    const account = await c.query(
      'SELECT organization_id FROM treetracker.grower_account WHERE id=$1 FOR UPDATE',
      [grower],
    );
    if (!account.rowCount) throw new DomainError(404, 'Grower not found');
    const lockedProject = await c.query(
      'SELECT status FROM stakeholder.project WHERE id=$1 FOR UPDATE',
      [project.id],
    );
    if (body.action === 'assign' && lockedProject.rows[0].status !== 'active')
      throw new DomainError(409, 'Only active projects accept assignments');
    const membership = await c.query(
      'SELECT joined_at::text AS joined_at,left_at::text AS left_at,joined_at IS NOT DISTINCT FROM $3::timestamptz AS version_matches FROM stakeholder.project_grower WHERE project_id=$1 AND grower_account_id=$2 FOR UPDATE',
      [project.id, grower, body.joined_at],
    );
    const previous = membership.rows[0];
    if (
      (previous && !previous.version_matches) ||
      (!previous && body.joined_at !== null)
    )
      throw new DomainError(
        409,
        'Membership changed. Refresh before trying again.',
      );
    const active = previous && previous.left_at === null;
    if (
      (body.action === 'assign' && active) ||
      (body.action === 'remove' && !active)
    )
      throw new DomainError(
        409,
        'Membership already changed. Refresh the project.',
      );
    if (body.action === 'assign') {
      const eligible =
        account.rows[0].organization_id === project.organization_id ||
        (
          await c.query(
            "SELECT 1 FROM treetracker.grower_account_org WHERE grower_account_id=$1 AND organization_id=$2 AND status='active'",
            [grower, project.organization_id],
          )
        ).rowCount;
      if (!eligible)
        throw new DomainError(
          409,
          'Grower must belong to the project organization. A session link alone is insufficient.',
        );
      await c.query(
        'INSERT INTO stakeholder.project_grower(project_id,grower_account_id) VALUES($1,$2) ON CONFLICT(project_id,grower_account_id) DO UPDATE SET joined_at=clock_timestamp(),left_at=NULL',
        [project.id, grower],
      );
    } else
      await c.query(
        'UPDATE stakeholder.project_grower SET left_at=clock_timestamp() WHERE project_id=$1 AND grower_account_id=$2',
        [project.id, grower],
      );
    const audit = randomUUID();
    await c.query(
      `INSERT INTO stakeholder.project_grower_event(id,request_id,request_hash,project_id,grower_account_id,organization_id,action,actor_id,actor_name,reason,previous_joined_at,previous_left_at,source)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'project_management')`,
      [
        audit,
        requestId,
        hash,
        project.id,
        grower,
        project.organization_id,
        body.action,
        actor,
        request.user?.userName || request.user?.email || actor,
        reason,
        previous?.joined_at || null,
        previous?.left_at || null,
      ],
    );
    await c.query('COMMIT');
    return { id: audit, action: body.action };
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally {
    c.release();
  }
}
