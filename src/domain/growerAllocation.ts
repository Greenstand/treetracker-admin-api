import { createHash } from 'crypto';
import { Pool, PoolClient } from 'pg';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, uuid } from './validation';

// Default to ownerless observations. Existing allocations require a separate explicit
// platform-admin confirmation; never move issued tree/token assets.
export async function allocationSnapshot(
  db: Pool | PoolClient,
  grower: string,
  lock = false,
  includeExisting = false,
) {
  const sessions = await db.query(
    `SELECT s.id,s.organization_id,s.project_id FROM field_data.session s
    JOIN field_data.wallet_registration w ON w.id=s.originating_wallet_registration_id
    WHERE w.grower_account_id=$1 AND ($2::boolean OR (nullif(btrim(s.organization_id),'') IS NULL AND s.project_id IS NULL))
    AND NOT EXISTS(SELECT 1 FROM treetracker.capture c WHERE c.session_id=s.id
      AND ((NOT $2::boolean AND c.planting_organization_id IS NOT NULL) OR c.tree_id IS NOT NULL OR c.token_id IS NOT NULL
        OR c.grower_account_id IS DISTINCT FROM $1::uuid))
    ORDER BY s.id LIMIT 50001${lock ? ' FOR UPDATE OF s' : ''}`,
    [grower, includeExisting],
  );
  if (sessions.rows.length > 50000)
    throw new DomainError(
      409,
      'Too many sessions; allocate in reviewed batches',
    );
  const ids = sessions.rows.map((s) => s.id);
  const captures = await db.query(
    `SELECT c.id,c.planting_organization_id FROM treetracker.capture c
    WHERE c.grower_account_id=$1 AND ($3::boolean OR c.planting_organization_id IS NULL) AND c.tree_id IS NULL AND c.token_id IS NULL
      AND (c.session_id=ANY($2::uuid[]) OR c.session_id IS NULL)
    ORDER BY c.id LIMIT 50001${lock ? ' FOR UPDATE OF c' : ''}`,
    [grower, ids, includeExisting],
  );
  if (captures.rows.length > 50000)
    throw new DomainError(
      409,
      'Too many captures; allocate in reviewed batches',
    );
  const raw = await db.query(
    'SELECT count(*)::integer AS count FROM field_data.raw_capture WHERE session_id=ANY($1::uuid[])',
    [ids],
  );
  return {
    sessions: sessions.rows,
    captures: captures.rows,
    rawCount: Number(raw.rows[0].count),
  };
}
export function allocationVersion(
  snapshot: Awaited<ReturnType<typeof allocationSnapshot>>,
  organization: string,
  project: string | null,
  includeExisting = false,
) {
  return createHash('sha256')
    .update(
      JSON.stringify({ ...snapshot, organization, project, includeExisting }),
    )
    .digest('hex');
}
export async function allocationPreview(
  service: AdminDomainService,
  request: KeycloakRequest,
  id: string,
  query: Record<string, unknown>,
) {
  if (!request.user?.policy.policies.some((r) => r.name === 'greenstand-admin'))
    throw new DomainError(403, 'Platform administrator access is required');
  const target = uuid(query.organizationId, 'Organization');
  await service.organization(request, target, true);
  const project = query.projectId ? uuid(query.projectId, 'Project') : null;
  if (
    project &&
    !(
      await service.pool.query(
        "SELECT id FROM stakeholder.project WHERE id=$1 AND organization_id=$2 AND status='active'",
        [project, target],
      )
    ).rowCount
  )
    throw new DomainError(
      400,
      'Choose an active project in the destination organization',
    );
  const includeExisting = query.includeExisting === 'true';
  const snapshot = await allocationSnapshot(
    service.pool,
    uuid(id, 'Grower'),
    false,
    includeExisting,
  );
  return {
    sessions: snapshot.sessions.length,
    processedCaptures: snapshot.captures.length,
    rawCaptures: snapshot.rawCount,
    version: allocationVersion(snapshot, target, project, includeExisting),
  };
}
export async function allocateUnassigned(
  db: PoolClient,
  grower: string,
  target: string,
  project: string | null,
  expected: unknown,
  includeExisting = false,
) {
  if (
    project &&
    !(
      await db.query(
        "SELECT id FROM stakeholder.project WHERE id=$1 AND organization_id=$2 AND status='active' FOR SHARE",
        [project, target],
      )
    ).rowCount
  )
    throw new DomainError(
      400,
      'Choose an active project in the destination organization',
    );
  const snapshot = await allocationSnapshot(db, grower, true, includeExisting);
  if (
    typeof expected !== 'string' ||
    expected !== allocationVersion(snapshot, target, project, includeExisting)
  )
    throw new DomainError(
      409,
      'Unassigned captures changed. Refresh the allocation preview before saving.',
    );
  const sessions = snapshot.sessions.map((s) => s.id),
    captures = snapshot.captures.map((c) => c.id);
  await db.query(
    'UPDATE field_data.session SET organization_id=$2,project_id=$3 WHERE id=ANY($1::uuid[])',
    [sessions, target, project],
  );
  await db.query(
    'UPDATE treetracker.capture SET planting_organization_id=$2,updated_at=clock_timestamp() WHERE id=ANY($1::uuid[])',
    [captures, target],
  );
  return {
    project_id: project,
    reallocated_existing: includeExisting,
    sessions: snapshot.sessions,
    captures: snapshot.captures,
    raw_captures: snapshot.rawCount,
  };
}
