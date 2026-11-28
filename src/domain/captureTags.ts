import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, paging, text, uuid } from './validation';
export async function captureTags(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Record<string, unknown>,
) {
  // No unscoped dictionary, including for platform callers. Public flags are not an organization boundary.
  const scope = await service.organization(request, query.organizationId, true);
  await service.requirePermission(request, scope, 'verify_captures');
  const project = query.projectId ? uuid(query.projectId, 'Project') : null;
  if (
    project &&
    !(
      await service.pool.query(
        'SELECT id FROM stakeholder.project WHERE id=$1 AND organization_id=$2',
        [project, scope],
      )
    ).rowCount
  )
    throw new DomainError(404, 'Project not found in this organization');
  const search = (
      text(query.search, 'Tag search', false, 100) || ''
    ).toLowerCase(),
    { size, offset } = paging(query);
  const result = await service.pool.query(
    `SELECT DISTINCT ON (lower(t.name)) t.id,t.name FROM treetracker.tag t
    WHERE (t.owner_id=$1 OR (t.owner_id IS NULL AND t."isPublic" AND EXISTS(
      SELECT 1 FROM treetracker.capture_tag used JOIN treetracker.capture recorded ON recorded.id=used.capture_id
      WHERE used.tag_id=t.id AND used.status='active' AND recorded.status='active' AND recorded.planting_organization_id=$1::uuid))) AND t.status='active' AND ($2='' OR strpos(lower(t.name),$2)>0)
      AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM treetracker.capture_tag ct
        JOIN treetracker.capture c ON c.id=ct.capture_id JOIN field_data.session s ON s.id=c.session_id
        WHERE ct.tag_id=t.id AND ct.status='active' AND c.status='active' AND c.planting_organization_id=$1::uuid
          AND s.project_id=$3 AND (s.organization_id=$1 OR s.organization_id=(SELECT entity_id::text FROM stakeholder.stakeholder WHERE id=$1::uuid))))
    ORDER BY lower(t.name),(t.owner_id=$1) DESC NULLS LAST,t.id LIMIT $4 OFFSET $5`,
    [scope, search, project, size + 1, offset],
  );
  return {
    rows: result.rows.slice(0, size),
    hasNext: result.rows.length > size,
  };
}
