import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import {
  DomainError,
  uuid,
  text,
  paging,
  projectValues,
  imageUrl,
} from './validation';
type Query = Record<string, unknown>;
export class AdminDomainService {
  constructor(public pool: Pool) {}
  async organization(
    request: KeycloakRequest,
    requested?: unknown,
    required = false,
  ): Promise<string | null> {
    const user = request.user;
    if (!user) throw new DomainError(401, 'Sign in is required');
    const platform = user.policy.policies.some(
      (p) => p.name === 'greenstand-admin',
    );
    let assigned: string | null = null;
    if (!platform) {
      if (
        !user.policy.policies.some((p) =>
          ['org', 'org-admin-saas'].includes(p.name),
        )
      )
        throw new DomainError(403, 'Organization access is required');
      const id = user.policy.organization?.id;
      if (!Number.isSafeInteger(id))
        throw new DomainError(
          403,
          'Approved organization membership is required',
        );
      const result = await this.pool.query(
        "SELECT id FROM stakeholder.stakeholder WHERE entity_id=$1 AND lower(type)='organization' AND active IS TRUE",
        [id],
      );
      if (result.rows.length !== 1)
        throw new DomainError(
          403,
          'Organization membership could not be resolved',
        );
      assigned = result.rows[0].id;
    }
    const selected = requested ? uuid(requested, 'Organization') : assigned;
    if (!platform && selected !== assigned)
      throw new DomainError(403, 'Organization is outside your membership');
    if (required && !selected)
      throw new DomainError(400, 'Choose an organization');
    if (selected) {
      const result = await this.pool.query(
        "SELECT id FROM stakeholder.stakeholder WHERE id=$1 AND lower(type)='organization' AND active IS TRUE",
        [selected],
      );
      if (!result.rowCount)
        throw new DomainError(404, 'Active organization not found');
    }
    return selected;
  }
  async organizations(request: KeycloakRequest, query: Query) {
    const scope = await this.organization(request, query.organizationId);
    const { size, offset } = paging(query),
      search = (text(query.search, 'Search', false, 160) ?? '').toLowerCase();
    const sort =
      { name: 'o.org_name', created_at: 'o.created_at', email: 'o.email' }[
        String(query.sort)
      ] ?? 'o.org_name';
    const direction = query.direction === 'desc' ? 'DESC' : 'ASC';
    const result = await this.pool.query(
      `SELECT o.id,o.entity_id AS keycloak_organization_id,o.org_name AS name,
      o.email,o.phone,o.website,o.logo_url,o.active,o.updated_at::text AS updated_at,o.created_at,
      (SELECT count(*) FROM stakeholder.project p WHERE p.organization_id=o.id) AS project_count
      FROM stakeholder.stakeholder o WHERE lower(o.type)='organization' AND ($1::uuid IS NULL OR o.id=$1)
      AND ($2='' OR strpos(lower(concat_ws(' ',o.org_name,o.email,o.phone)),$2)>0)
      ORDER BY ${sort} ${direction} NULLS LAST,o.id LIMIT $3 OFFSET $4`,
      [scope, search, size + 1, offset],
    );
    return this.page(result.rows, size);
  }
  async saveOrganization(id: string | undefined, body: Query) {
    const values = [
      text(body.name, 'Organization name', true, 200),
      text(body.email, 'Email', false, 254),
      text(body.phone, 'Phone', false, 80),
      text(body.website, 'Website', false, 2048),
      imageUrl(body.logo_url),
    ];
    if (values[1] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values[1])))
      throw new DomainError(400, 'Enter a valid email');
    if (values[3]) {
      try {
        if (!['http:', 'https:'].includes(new URL(String(values[3])).protocol))
          throw new Error();
      } catch {
        throw new DomainError(400, 'Enter a valid website URL');
      }
    }
    const result = id
      ? await this.pool.query(
          `UPDATE stakeholder.stakeholder SET org_name=$1,email=$2,phone=$3,website=$4,
        logo_url=$5,updated_at=clock_timestamp() WHERE id=$6 AND lower(type)='organization'
        AND updated_at IS NOT DISTINCT FROM $7::timestamptz RETURNING id`,
          [...values, uuid(id), this.version(body)],
        )
      : await this.pool.query(
          `INSERT INTO stakeholder.stakeholder
        (id,type,org_name,email,phone,website,logo_url,active,created_at,updated_at)
        VALUES($6,'organization',$1,$2,$3,$4,$5,true,now(),now()) RETURNING id`,
          [...values, randomUUID()],
        );
    if (!result.rowCount)
      throw new DomainError(
        409,
        'Organization changed. Refresh before saving.',
      );
    return result.rows[0];
  }
  async projects(request: KeycloakRequest, query: Query) {
    const scope = await this.organization(request, query.organizationId);
    const { size, offset } = paging(query),
      search = (text(query.search, 'Search', false, 160) ?? '').toLowerCase();
    const sort =
      {
        name: 'p.name',
        code: 'p.code',
        country: 'p.country',
        organization_name: 'o.org_name',
        status: 'p.status',
        target_trees: 'p.target_trees',
        target_captures: 'p.target_captures',
      }[String(query.sort)] ?? 'p.name';
    const direction = query.direction === 'desc' ? 'DESC' : 'ASC';
    const result = await this.pool.query(
      `SELECT p.*,p.updated_at::text AS updated_at,o.org_name AS organization_name,o.logo_url AS organization_logo_url,
      (SELECT count(*) FROM stakeholder.project_grower pg WHERE pg.project_id=p.id AND pg.left_at IS NULL) AS growers
      FROM stakeholder.project p JOIN stakeholder.stakeholder o ON o.id=p.organization_id
      WHERE ($1::uuid IS NULL OR p.organization_id=$1)
      AND ($2='' OR strpos(lower(concat_ws(' ',p.name,p.code,p.country,o.org_name)),$2)>0)
      ORDER BY ${sort} ${direction} NULLS LAST,p.id LIMIT $3 OFFSET $4`,
      [scope, search, size + 1, offset],
    );
    return this.page(result.rows, size);
  }
  async saveProject(
    request: KeycloakRequest,
    id: string | undefined,
    body: Query,
  ) {
    const organization = await this.organization(
        request,
        body.organization_id,
        true,
      ),
      values = projectValues(body);
    await this.requirePermission(request, organization, 'manage_projects');
    const result = id
      ? await this.pool.query(
          `UPDATE stakeholder.project SET name=$1,code=$2,status=$3,description=$4,country=$5,
        region=$6,starts_on=$7,ends_on=$8,target_trees=$9,target_captures=$10,logo_url=$11,hero_image_url=$12,
        updated_at=clock_timestamp() WHERE id=$13 AND organization_id=$14 AND updated_at IS NOT DISTINCT FROM $15::timestamptz RETURNING *`,
          [...values, uuid(id), organization, this.version(body)],
        )
      : await this.pool.query(
          `WITH new_project AS (
        INSERT INTO stakeholder.project
        (name,code,status,description,country,region,starts_on,ends_on,target_trees,target_captures,logo_url,hero_image_url,id,organization_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *
        ), species_scope AS (
          INSERT INTO herbarium.species_selection_scope(organization_id,project_id)
          SELECT organization_id,id FROM new_project RETURNING project_id
        ) SELECT p.* FROM new_project p JOIN species_scope s ON s.project_id=p.id`,
          [...values, randomUUID(), organization],
        );
    if (!result.rowCount)
      throw new DomainError(
        409,
        'Project changed or is outside this organization. Refresh before saving.',
      );
    return result.rows[0];
  }
  async sessions(request: KeycloakRequest, query: Query) {
    const scope = await this.organization(request, query.organizationId);
    const { size, offset } = paging(query),
      search = (text(query.search, 'Search', false, 160) ?? '').toLowerCase();
    const sort =
      {
        start_time: 's.start_time',
        grower_name: 'g.first_name',
        organization_name: 'o.org_name',
        capture_count: 'm.capture_count',
        duration_minutes: 'm.duration_minutes',
        area_sq_m: 'a.area_sq_m',
      }[String(query.sort)] ?? 's.created_at';
    const direction = query.direction === 'asc' ? 'ASC' : 'DESC';
    const result = await this.pool.query(
      `SELECT s.id,s.project_id,s.start_time,s.created_at AS uploaded_at,s.processed_at,
      o.id AS organization_id,o.org_name AS organization_name,p.name AS project_name,
      nullif(trim(concat_ws(' ',g.first_name,g.last_name)),'') AS grower_name,
      m.*,a.area_sq_m,a.area_sq_m/4046.8564224 AS area_acres,
      CASE WHEN m.capture_count=0 THEN 'No captures' WHEN m.unknown>0 THEN 'Review unavailable' WHEN m.pending=0 THEN 'Reviewed' ELSE 'Awaiting review' END AS review_status
      FROM field_data.session s JOIN stakeholder.stakeholder o ON lower(o.type)='organization'
        AND (o.id::text=s.organization_id OR o.entity_id::text=s.organization_id)
      LEFT JOIN stakeholder.project p ON p.id=s.project_id AND p.organization_id=o.id
      LEFT JOIN field_data.wallet_registration w ON w.id=s.originating_wallet_registration_id
      LEFT JOIN treetracker.grower_account g ON g.id=w.grower_account_id
      CROSS JOIN LATERAL(SELECT count(*) AS capture_count,
        count(*) FILTER(WHERE status='approved') AS approved,count(*) FILTER(WHERE status='rejected') AS rejected,
        count(*) FILTER(WHERE status NOT IN('approved','rejected')) AS pending,count(*) FILTER(WHERE status IS NULL) AS unknown,
        min(captured_at) AS first_capture,max(captured_at) AS last_capture,
        extract(epoch FROM max(captured_at)-min(captured_at))/60 AS duration_minutes
        FROM (
        SELECT r.id,r.status,r.captured_at FROM field_data.raw_capture r WHERE r.session_id=s.id
        UNION ALL SELECT c.id,NULL::text AS status,c.captured_at FROM treetracker.capture c
          WHERE c.session_id=s.id AND c.status='active'
          AND (c.planting_organization_id IS NULL OR c.planting_organization_id=o.id)
          AND NOT EXISTS(SELECT 1 FROM field_data.raw_capture r WHERE r.id=c.id)
      ) captures) m
      CROSS JOIN LATERAL(SELECT nullif(public.ST_Area(public.ST_Union(
        public.ST_CollectionExtract(public.ST_MakeValid(convex_hull),3))::public.geography),0) AS area_sq_m
        FROM field_data.session_segment WHERE session_id=s.id) a
      WHERE ($1::uuid IS NULL OR o.id=$1)
        AND ($2='' OR strpos(lower(concat_ws(' ',g.first_name,g.last_name,o.org_name,p.name,s.id::text)),$2)>0)
      ORDER BY ${sort} ${direction} NULLS LAST,s.id LIMIT $3 OFFSET $4`,
      [scope, search, size + 1, offset],
    );
    return this.page(result.rows, size);
  }
  async sessionDetail(request: KeycloakRequest, id: string) {
    const scope = await this.organization(request);
    const session = await this.pool.query(
      `SELECT s.id,o.id AS organization_id FROM field_data.session s JOIN stakeholder.stakeholder o
      ON lower(o.type)='organization' AND (o.id::text=s.organization_id OR o.entity_id::text=s.organization_id)
      WHERE s.id=$1 AND ($2::uuid IS NULL OR o.id=$2)`,
      [uuid(id), scope],
    );
    if (!session.rowCount) throw new DomainError(404, 'Session not found');
    const result = await this.pool.query(
      `SELECT * FROM (
        SELECT id,image_url,lat,lon,captured_at,status,rejection_reason FROM field_data.raw_capture WHERE session_id=$1
        UNION ALL SELECT c.id,c.image_url,c.lat,c.lon,c.captured_at,NULL::text,NULL::text
          FROM treetracker.capture c WHERE c.session_id=$1 AND c.status='active'
          AND (c.planting_organization_id IS NULL OR c.planting_organization_id=$2)
          AND NOT EXISTS(SELECT 1 FROM field_data.raw_capture r WHERE r.id=c.id)
      ) captures ORDER BY captured_at,id LIMIT 1001`,
      [id, session.rows[0].organization_id],
    );
    return {
      rows: result.rows.slice(0, 1000),
      limited: result.rows.length > 1000,
    };
  }
  async contracts(request: KeycloakRequest, query: Query) {
    const scope = await this.organization(request, query.organizationId);
    await this.requirePermission(request, scope, 'view_contracts');
    const { size, offset } = paging(query),
      search = (text(query.search, 'Search', false, 160) ?? '').toLowerCase();
    const result = await this.pool.query(
      `SELECT c.id,c.status,c.notes,c.signed_at,c.closed_at,c.created_at,
      a.name AS agreement_name,a.description,a.capture_payment,a.capture_payment_currency,
      a.growing_organization_id AS organization_id,o.org_name AS organization_name,
      nullif(trim(concat_ws(' ',w.first_name,w.last_name,w.org_name)),'') AS worker_name
      FROM contracts.contract c JOIN contracts.agreement a ON a.id=c.agreement_id
      LEFT JOIN stakeholder.stakeholder o ON o.id=a.growing_organization_id
      LEFT JOIN stakeholder.stakeholder w ON w.id=c.worker_id
      WHERE c.listed IS TRUE AND ($1::uuid IS NULL OR a.growing_organization_id=$1 OR a.owner_id=$1)
      AND ($2='' OR strpos(lower(concat_ws(' ',a.name,o.org_name,w.first_name,w.last_name,c.notes)),$2)>0)
      ORDER BY c.created_at DESC,c.id LIMIT $3 OFFSET $4`,
      [scope, search, size + 1, offset],
    );
    return this.page(result.rows, size);
  }
  async contractDocuments(request: KeycloakRequest, id: string) {
    const scope = await this.organization(request);
    await this.requirePermission(request, scope, 'view_contracts');
    const result = await this.pool.query(
      `SELECT d.id,d.name,d.description,d.version,d.hardcopy_url
      FROM contracts.contract c JOIN contracts.agreement a ON a.id=c.agreement_id
      JOIN contracts.contract_document cd ON cd.contract_id=c.id AND cd.listed IS TRUE
      JOIN contracts.document d ON d.id=cd.document_id AND d.listed IS TRUE
      WHERE c.id=$1 AND ($2::uuid IS NULL OR a.growing_organization_id=$2 OR a.owner_id=$2)`,
      [uuid(id), scope],
    );
    return { rows: result.rows };
  }
  async species(query: Query) {
    const { size, offset } = paging(query),
      search = (text(query.search, 'Search', false, 160) ?? '').toLowerCase();
    const result = await this.pool.query(
      `SELECT s.*,s.updated_at::text AS updated_at,
      (SELECT string_agg(c.common_name,', ' ORDER BY c.common_name) FROM herbarium.common_name c
      WHERE c.species_id=s.id AND c.active IS TRUE AND NOT EXISTS(SELECT 1 FROM herbarium.organization_species os WHERE os.common_name_id=c.id)) AS common_name
      FROM herbarium.species s WHERE ($1='' OR strpos(lower(s.scientific_name),$1)>0
      OR EXISTS(SELECT 1 FROM herbarium.common_name c WHERE c.species_id=s.id AND c.active IS TRUE AND NOT EXISTS(SELECT 1 FROM herbarium.organization_species os WHERE os.common_name_id=c.id) AND strpos(lower(c.common_name),$1)>0))
      AND ($2::boolean OR NOT s.is_hidden) ORDER BY s.scientific_name,s.id LIMIT $3 OFFSET $4`,
      [search, query.includeHidden === 'true', size + 1, offset],
    );
    return this.page(result.rows, size);
  }
  async saveSpecies(id: string | undefined, body: Query) {
    const values = [
      text(body.scientific_name, 'Scientific name', true, 255),
      text(body.description, 'Description', false, 10000) ?? '',
      text(body.morphology, 'Morphology', false, 255),
      imageUrl(body.reference_url),
      body.is_hidden === true,
      body.is_default !== false,
    ];
    const result = id
      ? await this.pool.query(
          `UPDATE herbarium.species SET scientific_name=$1,description=$2,morphology=$3,
        reference_url=$4,is_hidden=$5,is_default=$6,updated_at=clock_timestamp()
        WHERE id=$7 AND updated_at IS NOT DISTINCT FROM $8::timestamptz RETURNING *`,
          [...values, uuid(id), this.version(body)],
        )
      : await this.pool.query(
          `INSERT INTO herbarium.species
        (scientific_name,description,morphology,reference_url,is_hidden,is_default,id)
        VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [...values, randomUUID()],
        );
    if (!result.rowCount)
      throw new DomainError(409, 'Species changed. Refresh before saving.');
    return result.rows[0];
  }
  async selectionScope(request: KeycloakRequest, query: Query) {
    const organization = await this.organization(
        request,
        query.organizationId,
        true,
      ),
      project = query.projectId ? uuid(query.projectId, 'Project') : null;
    if (project) {
      const result = await this.pool.query(
        'SELECT id FROM stakeholder.project WHERE id=$1 AND organization_id=$2',
        [project, organization],
      );
      if (!result.rowCount)
        throw new DomainError(403, 'Project is outside this organization');
    }
    return { organization, project };
  }
  async speciesSelection(request: KeycloakRequest, query: Query) {
    const { organization, project } = await this.selectionScope(request, query);
    const result = await this.pool.query(
      `SELECT ss.*,s.scientific_name,s.is_hidden FROM herbarium.species_selection ss
      JOIN herbarium.species s ON s.id=ss.species_id WHERE ss.organization_id=$1
      AND (ss.project_id=$2 OR ss.project_id IS NULL) ORDER BY s.scientific_name`,
      [organization, project],
    );
    const scopes = await this.pool.query(
      'SELECT project_id FROM herbarium.species_selection_scope WHERE organization_id=$1 AND (project_id=$2 OR project_id IS NULL)',
      [organization, project],
    );
    const names = await this.pool.query(
      `SELECT c.species_id,c.common_name AS name FROM herbarium.common_name c JOIN herbarium.organization_species os ON os.common_name_id=c.id WHERE os.organization_id=$1 AND os.active AND c.active ORDER BY c.common_name`,
      [organization],
    );
    const projectRows = result.rows.filter(
        (r) => project && r.project_id === project,
      ),
      orgRows = result.rows.filter((r) => r.project_id === null);
    if (
      project &&
      (projectRows.length || scopes.rows.some((r) => r.project_id === project))
    )
      return {
        source: 'Project',
        rows: projectRows.filter((r) => !r.is_hidden),
        localNames: names.rows,
      };
    if (orgRows.length || scopes.rows.some((r) => r.project_id === null))
      return {
        source: 'Organization',
        rows: orgRows.filter((r) => !r.is_hidden),
        localNames: names.rows,
      };
    const defaults = await this.pool
      .query(`SELECT id AS species_id,scientific_name,NULL::text AS local_name
      FROM herbarium.species WHERE is_default AND NOT is_hidden ORDER BY scientific_name`);
    return {
      source: 'Default catalog',
      rows: defaults.rows,
      localNames: names.rows,
    };
  }
  async saveSpeciesSelection(request: KeycloakRequest, body: Query) {
    const { organization, project } = await this.selectionScope(request, body);
    await this.requirePermission(request, organization, 'manage_species');
    if (!Array.isArray(body.species) || body.species.length > 1000)
      throw new DomainError(400, 'Choose at most 1000 species');
    const selections = body.species.map((entry: Record<string, unknown>) => ({
      species_id: uuid(entry.species_id, 'Species'),
      local_name: text(entry.local_name, 'Local name', false, 255),
    }));
    if (new Set(selections.map((s) => s.species_id)).size !== selections.length)
      throw new DomainError(400, 'Duplicate species');
    const extras = body.localNames ?? [];
    if (!Array.isArray(extras) || extras.length > 1000)
      throw new DomainError(400, 'Choose at most 1000 local names');
    const localNames = extras.map((entry: Record<string, unknown>) => ({
      species_id: uuid(entry.species_id, 'Species'),
      name: text(entry.name, 'Local name', true, 255),
    }));
    for (const entry of selections)
      if (entry.local_name)
        localNames.push({
          species_id: entry.species_id,
          name: entry.local_name,
        });
    // Older callers used an empty array to restore inheritance. New callers
    // explicitly distinguish an empty custom list from inheriting the parent.
    const inherit =
      body.inherit === true ||
      (body.inherit === undefined && !selections.length);
    if (inherit && selections.length)
      throw new DomainError(400, 'An inherited list cannot include selections');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [organization + ':species'],
      );
      const ids = [
        ...new Set([...selections, ...localNames].map((s) => s.species_id)),
      ];
      const valid = await client.query(
        'SELECT id FROM herbarium.species WHERE id=ANY($1::uuid[]) AND NOT is_hidden',
        [ids],
      );
      if (valid.rowCount !== ids.length)
        throw new DomainError(400, 'Selection contains unavailable species');
      await client.query(
        'DELETE FROM herbarium.species_selection WHERE organization_id=$1 AND project_id IS NOT DISTINCT FROM $2::uuid',
        [organization, project],
      );
      await client.query(
        'DELETE FROM herbarium.species_selection_scope WHERE organization_id=$1 AND project_id IS NOT DISTINCT FROM $2::uuid',
        [organization, project],
      );
      if (!inherit) {
        await client.query(
          'INSERT INTO herbarium.species_selection_scope(organization_id,project_id) VALUES($1,$2)',
          [organization, project],
        );
        await client.query(
          `INSERT INTO herbarium.species_selection(organization_id,project_id,species_id,local_name)
          SELECT $1::uuid,$2::uuid,species_id,local_name FROM jsonb_to_recordset($3::jsonb) AS x(species_id uuid,local_name text)`,
          [organization, project, JSON.stringify(selections)],
        );
      }
      // The existing NDM relation links organization-specific common names.
      // Unlinked common names remain the global name library.
      await client.query(
        `WITH incoming AS (
          SELECT DISTINCT ON (species_id,lower(name)) species_id,name FROM jsonb_to_recordset($2::jsonb) AS x(species_id uuid,name text)
        ), created AS (
          INSERT INTO herbarium.common_name(species_id,common_name)
          SELECT i.species_id,i.name FROM incoming i WHERE NOT EXISTS (
            SELECT 1 FROM herbarium.common_name c WHERE c.species_id=i.species_id AND lower(c.common_name)=lower(i.name) AND c.active
            AND (NOT EXISTS(SELECT 1 FROM herbarium.organization_species os WHERE os.common_name_id=c.id)
              OR EXISTS(SELECT 1 FROM herbarium.organization_species os WHERE os.common_name_id=c.id AND os.organization_id=$1 AND os.active)))
          RETURNING id
        ) INSERT INTO herbarium.organization_species(organization_id,common_name_id)
          SELECT $1::uuid,id FROM created`,
        [organization, JSON.stringify(localNames)],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return this.speciesSelection(request, body);
  }
  async dashboard(request: KeycloakRequest, query: Query) {
    const scope = await this.organization(request, query.organizationId);
    const result = await this.pool.query(
      `SELECT
      (SELECT count(*) FROM stakeholder.project WHERE $1::uuid IS NULL OR organization_id=$1) AS projects,
      (SELECT count(*) FROM treetracker.grower_account WHERE $1::uuid IS NULL OR organization_id=$1) AS growers,
      (SELECT count(*) FROM treetracker.capture WHERE status='active' AND ($1::uuid IS NULL OR planting_organization_id=$1)) AS captures,
      (SELECT count(*) FROM field_data.session s JOIN stakeholder.stakeholder o ON lower(o.type)='organization'
        AND (o.id::text=s.organization_id OR o.entity_id::text=s.organization_id) WHERE $1::uuid IS NULL OR o.id=$1) AS sessions`,
      [scope],
    );
    const activity = await this.pool.query(
      `SELECT c.id,c.tree_id,c.created_at,
      nullif(trim(concat_ws(' ',g.first_name,g.last_name)),'') AS grower_name
      FROM treetracker.capture c LEFT JOIN treetracker.grower_account g ON g.id=c.grower_account_id
      WHERE c.status='active' AND ($1::uuid IS NULL OR c.planting_organization_id=$1)
      ORDER BY c.created_at DESC,c.id DESC LIMIT 6`,
      [scope],
    );
    return { ...result.rows[0], activity: activity.rows };
  }
  version(body: Query) {
    if (!Object.prototype.hasOwnProperty.call(body, 'updated_at')) {
      throw new DomainError(400, 'The record version is required');
    }
    return text(body.updated_at, 'Version');
  }

  async permissions(request: KeycloakRequest, organizationId: string | null) {
    const all = [
      'verify_captures',
      'manage_projects',
      'manage_species',
      'view_contracts',
      'manage_members',
    ];
    if (
      request.user?.policy.policies.some((role) =>
        ['greenstand-admin', 'org-admin-saas'].includes(role.name),
      )
    ) {
      return all;
    }
    if (!organizationId) return [];
    const result = await this.pool.query(
      'SELECT permissions FROM stakeholder.organization_user WHERE organization_id=$1 AND keycloak_user_id=$2',
      [organizationId, request.user?.id],
    );
    return result.rows[0]?.permissions ?? ['verify_captures'];
  }

  async requirePermission(
    request: KeycloakRequest,
    organizationId: string | null,
    permission: string,
  ) {
    if (
      !(await this.permissions(request, organizationId)).includes(permission)
    ) {
      throw new DomainError(
        403,
        'Your organization role does not permit this operation',
      );
    }
  }

  page(rows: Record<string, unknown>[], size: number) {
    return { rows: rows.slice(0, size), hasNext: rows.length > size };
  }
}
