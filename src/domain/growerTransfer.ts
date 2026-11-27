import { allocateUnassigned } from './growerAllocation';
import { createHash, randomUUID } from 'crypto';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, text, uuid } from './validation';
function platform(request: KeycloakRequest) {
  if (!request.user?.policy.policies.some((x) => x.name === 'greenstand-admin'))
    throw new DomainError(403, 'Platform administrator access is required');
}
export async function growerTransfers(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
) {
  platform(request);
  const r = await service.pool.query(
    `SELECT h.id,h.previous_organization_id,h.new_organization_id,h.administrator_id,h.administrator_name,h.reason,h.created_at,h.closed_project_ids,
    CASE WHEN jsonb_typeof(h.capture_allocation)='object' THEN jsonb_build_object(
      'project_id',h.capture_allocation->'project_id',
      'session_count',jsonb_array_length(h.capture_allocation->'sessions'),
      'capture_count',jsonb_array_length(h.capture_allocation->'captures'),
      'raw_captures',h.capture_allocation->'raw_captures') ELSE NULL END AS capture_allocation,
    old.org_name AS previous_organization_name,target.org_name AS new_organization_name
    FROM treetracker.grower_organization_transfer h LEFT JOIN stakeholder.stakeholder old ON old.id=h.previous_organization_id
    LEFT JOIN stakeholder.stakeholder target ON target.id=h.new_organization_id
    WHERE h.grower_account_id=$1 ORDER BY h.created_at DESC,h.id LIMIT 25`,
    [uuid(id, 'Grower')],
  );
  return { rows: r.rows };
}
export async function transferGrower(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  body: Record<string, unknown>,
) {
  platform(request);
  const actor = uuid(request.user?.id, 'Administrator'),
    grower = uuid(id, 'Grower'),
    target = uuid(body.organization_id, 'Organization'),
    requestId = uuid(body.requestId, 'Request');
  const allocate = body.allocate_unassigned === true;
  const includeExisting = body.reallocate_existing === true;
  if (includeExisting && !allocate)
    throw new DomainError(
      400,
      'Confirm capture allocation before reassigning owned observations',
    );
  const project = body.project_id ? uuid(body.project_id, 'Project') : null;
  if (project && !allocate)
    throw new DomainError(
      400,
      'Confirm capture allocation before choosing a project',
    );
  const reason = text(body.reason, 'Transfer reason', true, 1000),
    version = service.version(body);
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        actor,
        grower,
        target,
        reason,
        version,
        allocate,
        project,
        allocationVersion: body.expected_allocation,
        includeExisting,
      }),
    )
    .digest('hex');
  const c = await service.pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'grower-transfer:' + requestId,
    ]);
    const prior = await c.query(
      'SELECT * FROM treetracker.grower_organization_transfer WHERE request_id=$1',
      [requestId],
    );
    if (prior.rowCount) {
      if (prior.rows[0].request_hash !== hash)
        throw new DomainError(409, 'Request ID was already used');
      await c.query('COMMIT');
      return { id: prior.rows[0].id, replayed: true };
    }
    const locked = await c.query(
      'SELECT id,organization_id FROM treetracker.grower_account WHERE id=$1 FOR UPDATE',
      [grower],
    );
    if (!locked.rowCount)
      throw new DomainError(404, 'Grower account not found');
    const old = locked.rows[0].organization_id;
    if (old === target && !allocate)
      throw new DomainError(409, 'Grower already belongs to this organization');
    if (
      !(
        await c.query(
          "SELECT id FROM stakeholder.stakeholder WHERE id=$1 AND lower(type)='organization' AND active",
          [target],
        )
      ).rowCount
    )
      throw new DomainError(400, 'Choose an active organization');
    const updated = await c.query(
      'UPDATE treetracker.grower_account SET organization_id=$2,updated_at=clock_timestamp() WHERE id=$1 AND updated_at IS NOT DISTINCT FROM $3::timestamptz',
      [grower, target, version],
    );
    if (!updated.rowCount)
      throw new DomainError(409, 'Grower changed. Refresh before moving them.');
    if (old && old !== target)
      await c.query(
        "UPDATE treetracker.grower_account_org SET status='deleted',updated_at=clock_timestamp() WHERE grower_account_id=$1 AND organization_id=$2 AND status='active'",
        [grower, old],
      );
    const links = await c.query(
      'SELECT id FROM treetracker.grower_account_org WHERE grower_account_id=$1 AND organization_id=$2 FOR UPDATE',
      [grower, target],
    );
    if (links.rowCount)
      await c.query(
        "UPDATE treetracker.grower_account_org SET status='active',updated_at=clock_timestamp() WHERE grower_account_id=$1 AND organization_id=$2",
        [grower, target],
      );
    else
      await c.query(
        'INSERT INTO treetracker.grower_account_org(grower_account_id,organization_id) VALUES($1,$2)',
        [grower, target],
      );
    const closed =
      old && old !== target
        ? await c.query(
            `UPDATE stakeholder.project_grower pg SET left_at=clock_timestamp() FROM stakeholder.project p
      WHERE pg.project_id=p.id AND pg.grower_account_id=$1 AND pg.left_at IS NULL AND p.organization_id=$2 RETURNING pg.project_id,pg.joined_at::text AS joined_at`,
            [grower, old],
          )
        : { rows: [] };
    const captureAllocation = allocate
      ? await allocateUnassigned(
          c,
          grower,
          target,
          project,
          body.expected_allocation,
          includeExisting,
        )
      : null;
    if (
      old === target &&
      !captureAllocation?.sessions.length &&
      !captureAllocation?.captures.length
    )
      throw new DomainError(
        409,
        'No unassigned captures or sessions to allocate',
      );
    const auditId = randomUUID();
    await c.query(
      `INSERT INTO treetracker.grower_organization_transfer(id,request_id,request_hash,grower_account_id,previous_organization_id,new_organization_id,administrator_id,administrator_name,reason,closed_project_ids,capture_allocation)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        auditId,
        requestId,
        hash,
        grower,
        old,
        target,
        actor,
        request.user?.userName || request.user?.email || actor,
        reason,
        JSON.stringify(closed.rows.map((x) => x.project_id)),
        JSON.stringify(captureAllocation),
      ],
    );
    for (const membership of closed.rows) {
      await c.query(
        `INSERT INTO stakeholder.project_grower_event(id,request_id,request_hash,project_id,grower_account_id,organization_id,action,actor_id,actor_name,reason,previous_joined_at,source)
        VALUES($1,$2,$3,$4,$5,$6,'remove',$7,$8,$9,$10,'organization_transfer')`,
        [
          randomUUID(),
          requestId,
          hash,
          membership.project_id,
          grower,
          old,
          actor,
          request.user?.userName || request.user?.email || actor,
          reason,
          membership.joined_at,
        ],
      );
    }
    await c.query('COMMIT');
    return {
      id: auditId,
      organization_id: target,
      closedAssignments: closed.rows.length,
      allocatedSessions: captureAllocation?.sessions.length || 0,
      allocatedCaptures: captureAllocation?.captures.length || 0,
    };
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally {
    c.release();
  }
}
