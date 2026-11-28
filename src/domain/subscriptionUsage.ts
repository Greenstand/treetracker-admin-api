import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
export async function subscriptionUsage(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Record<string, unknown>,
) {
  const scope = await service.organization(request, query.organizationId, true);
  const result = await service.pool.query(
    `WITH owned_sessions AS MATERIALIZED (
    SELECT s.id,s.originating_wallet_registration_id FROM field_data.session s
    JOIN stakeholder.stakeholder o ON o.id=$1 AND (s.organization_id=o.id::text OR s.organization_id=o.entity_id::text)
  ), managed_captures AS (
    SELECT r.id FROM field_data.raw_capture r JOIN owned_sessions s ON s.id=r.session_id
    UNION SELECT c.id FROM treetracker.capture c WHERE c.planting_organization_id=$1 AND c.status='active'
  ), managed_growers AS (
    SELECT g.id FROM treetracker.grower_account g WHERE g.organization_id=$1
    UNION SELECT g.id FROM stakeholder.project_grower pg JOIN stakeholder.project p ON p.id=pg.project_id
      JOIN treetracker.grower_account g ON g.id=pg.grower_account_id WHERE p.organization_id=$1 AND pg.left_at IS NULL
    UNION SELECT g.id FROM owned_sessions s JOIN field_data.wallet_registration w ON w.id=s.originating_wallet_registration_id
      JOIN treetracker.grower_account g ON g.id=w.grower_account_id
  ) SELECT (SELECT count(*) FROM stakeholder.project WHERE organization_id=$1) AS projects,
    (SELECT count(*) FROM managed_captures) AS captures,(SELECT count(*) FROM managed_growers) AS growers,
    now() AS as_of`,
    [scope],
  );
  const row = result.rows[0];
  return {
    organizationId: scope,
    projects: Number(row.projects),
    captures: Number(row.captures),
    growers: Number(row.growers),
    asOf: row.as_of,
  };
}
