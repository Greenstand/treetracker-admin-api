import { createHash, randomUUID } from 'crypto';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, paging, text, uuid } from './validation';
type Input = Record<string, unknown>;
const sessionSql = `SELECT s.id,s.project_id,o.id AS organization_id,COALESCE(o.org_name,'Unassigned / unresolved') AS organization_name,p.name AS project_name,
  (SELECT h.id FROM field_data.session_project_event h WHERE h.session_id=s.id ORDER BY h.created_at DESC,h.id DESC LIMIT 1) AS allocation_event_id
  FROM field_data.session s LEFT JOIN stakeholder.stakeholder o ON lower(o.type)='organization'
  AND (s.organization_id=o.id::text OR s.organization_id=o.entity_id::text)
  LEFT JOIN stakeholder.project p ON p.id=s.project_id AND p.organization_id=o.id
  WHERE s.id=$1 AND ($2::uuid IS NULL OR o.id=$2)`;
export async function sessionProject(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  query: Input,
) {
  const scope = await service.organization(request, query.organizationId);
  const result = await service.pool.query(sessionSql, [
    uuid(id, 'Session'),
    scope,
  ]);
  if (!result.rowCount) throw new DomainError(404, 'Session not found');
  const { size, offset } = paging(query);
  const history = await service.pool.query(
    `SELECT h.*,old.name AS previous_project_name,target.name AS new_project_name
    FROM field_data.session_project_event h LEFT JOIN stakeholder.project old ON old.id=h.previous_project_id
    LEFT JOIN stakeholder.project target ON target.id=h.new_project_id
    WHERE h.session_id=$1 ORDER BY h.created_at DESC,h.id DESC LIMIT $2 OFFSET $3`,
    [id, size + 1, offset],
  );
  return {
    ...result.rows[0],
    history: history.rows.slice(0, size),
    hasNext: history.rows.length > size,
  };
}
export async function changeSessionProject(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  body: Input,
) {
  // Session organization/project ownership is an existing allocation, even when project_id is null.
  if (
    !request.user?.policy.policies.some(
      (role) => role.name === 'greenstand-admin',
    )
  )
    throw new DomainError(
      403,
      'Only Greenstand administrators can change an existing session allocation',
    );
  const scope = await service.organization(request, body.organizationId),
    session = uuid(id, 'Session'),
    actor = uuid(request.user?.id, 'Administrator'),
    requestId = uuid(body.requestId, 'Request');
  const target =
    body.project_id === null ? null : uuid(body.project_id, 'Project');
  const previous =
    body.expected_project_id === null
      ? null
      : uuid(body.expected_project_id, 'Previous project');
  const version =
    body.expected_event_id === null
      ? null
      : uuid(body.expected_event_id, 'Allocation version');
  const reason = text(body.reason, 'Allocation reason', true, 1000);
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        scope,
        session,
        actor,
        target,
        previous,
        version,
        reason,
      }),
    )
    .digest('hex');
  const c = await service.pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'session-project:' + requestId,
    ]);
    const locked = await c.query(sessionSql + ' FOR UPDATE OF s', [
      session,
      scope,
    ]);
    if (!locked.rowCount) throw new DomainError(404, 'Session not found');
    const row = locked.rows[0];
    if (!row.organization_id)
      throw new DomainError(
        409,
        'Allocate the session to an organization from the grower profile before choosing a project',
      );
    await service.requirePermission(
      request,
      row.organization_id,
      'manage_projects',
    );
    const prior = await c.query(
      'SELECT id,request_hash FROM field_data.session_project_event WHERE request_id=$1',
      [requestId],
    );
    if (prior.rowCount) {
      if (prior.rows[0].request_hash !== hash)
        throw new DomainError(409, 'Request ID was already used');
      await c.query('COMMIT');
      return { id: prior.rows[0].id, replayed: true };
    }
    // Read history after obtaining the session lock so concurrent corrections cannot use a stale snapshot.
    const latest = await c.query(
      'SELECT id FROM field_data.session_project_event WHERE session_id=$1 ORDER BY created_at DESC,id DESC LIMIT 1',
      [session],
    );
    if (row.project_id !== previous || (latest.rows[0]?.id || null) !== version)
      throw new DomainError(
        409,
        'Session allocation changed. Refresh before saving.',
      );
    if (target === row.project_id)
      throw new DomainError(
        409,
        'This project is already allocated to the session',
      );
    if (target) {
      const project = await c.query(
        "SELECT id FROM stakeholder.project WHERE id=$1 AND organization_id=$2 AND status='active' FOR SHARE",
        [target, row.organization_id],
      );
      if (!project.rowCount)
        throw new DomainError(
          400,
          'Choose an active project in the session organization',
        );
    }
    await c.query('UPDATE field_data.session SET project_id=$2 WHERE id=$1', [
      session,
      target,
    ]);
    const audit = randomUUID();
    await c.query(
      `INSERT INTO field_data.session_project_event(id,request_id,request_hash,session_id,organization_id,previous_project_id,new_project_id,actor_id,actor_name,reason)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        audit,
        requestId,
        hash,
        session,
        row.organization_id,
        row.project_id,
        target,
        actor,
        request.user?.userName || request.user?.email || actor,
        reason,
      ],
    );
    await c.query('COMMIT');
    return { id: audit, project_id: target };
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally {
    c.release();
  }
}
