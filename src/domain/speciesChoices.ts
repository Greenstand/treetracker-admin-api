import { Pool } from 'pg';
export type SpeciesContext = {
  organization_id: string;
  project_id: string | null;
};
/** A saved empty scope is an override, not a request for global defaults. */
export async function effectiveSpecies(
  db: Pick<Pool, 'query'>,
  contexts: SpeciesContext[],
) {
  if (!contexts.length) return [];
  const result = await db.query(
    `WITH contexts AS (
      SELECT DISTINCT organization_id,project_id FROM jsonb_to_recordset($1::jsonb)
      AS x(organization_id uuid,project_id uuid)
    ), scopes AS (
      SELECT c.*,
        c.project_id IS NOT NULL AND (
          EXISTS(SELECT 1 FROM herbarium.species_selection_scope s WHERE s.organization_id=c.organization_id AND s.project_id=c.project_id)
          OR EXISTS(SELECT 1 FROM herbarium.species_selection s WHERE s.organization_id=c.organization_id AND s.project_id=c.project_id)
        ) AS project_custom,
        EXISTS(SELECT 1 FROM herbarium.species_selection_scope s WHERE s.organization_id=c.organization_id AND s.project_id IS NULL)
          OR EXISTS(SELECT 1 FROM herbarium.species_selection s WHERE s.organization_id=c.organization_id AND s.project_id IS NULL) AS org_custom
      FROM contexts c
    ) SELECT s.id,s.herbarium_name,s.scientific_name FROM herbarium.species s
    WHERE NOT s.is_hidden AND NOT EXISTS (
      SELECT 1 FROM scopes c WHERE NOT CASE
        WHEN c.project_custom THEN EXISTS(SELECT 1 FROM herbarium.species_selection a WHERE a.species_id=s.id AND a.organization_id=c.organization_id AND a.project_id=c.project_id)
        WHEN c.org_custom THEN EXISTS(SELECT 1 FROM herbarium.species_selection a WHERE a.species_id=s.id AND a.organization_id=c.organization_id AND a.project_id IS NULL)
        ELSE s.is_default END
    ) ORDER BY coalesce(s.herbarium_name,s.scientific_name),s.id`,
    [JSON.stringify(contexts)],
  );
  return result.rows;
}
