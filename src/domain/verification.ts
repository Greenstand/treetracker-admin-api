import { createHash, randomUUID } from 'crypto';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { date, DomainError, paging, text, uuid } from './validation';
type Input = Record<string, unknown>;

export function verificationInput(body: Input) {
  if (!['approved', 'rejected'].includes(String(body.decision)))
    throw new DomainError(400, 'Choose approve or reject');
  if (
    !Array.isArray(body.captures) ||
    !body.captures.length ||
    body.captures.length > 100
  )
    throw new DomainError(400, 'Select between 1 and 100 captures');
  const captures = body.captures
    .map((entry: Input) => ({
      id: uuid(entry.id, 'Capture'),
      updated_at: text(entry.updated_at, 'Capture version', true, 100),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(captures.map((x) => x.id)).size !== captures.length)
    throw new DomainError(400, 'Duplicate captures');
  if (captures.some((x) => !Number.isFinite(Date.parse(x.updated_at!))))
    throw new DomainError(400, 'Invalid capture version');
  const reason = text(
    body.rejection_reason,
    'Rejection reason',
    body.decision === 'rejected',
    1000,
  );
  const morphology = text(
    body.morphology,
    'Morphology',
    body.decision === 'approved',
    100,
  );
  if (
    morphology &&
    !['seedling', 'direct_seeding', 'pruned_tied'].includes(morphology)
  )
    throw new DomainError(400, 'Invalid morphology');
  if (
    body.age !== undefined &&
    body.age !== null &&
    ![0, 2].includes(body.age as number)
  )
    throw new DomainError(400, 'Choose new tree or over two years');
  const tags = body.tags ?? [];
  if (!Array.isArray(tags) || tags.length > 20)
    throw new DomainError(400, 'Choose at most 20 tags');
  return {
    requestId: uuid(body.requestId, 'Request'),
    captures,
    decision: String(body.decision),
    reason,
    annotations: {
      morphology,
      age: body.age ?? null,
      species_id: body.species_id ? uuid(body.species_id, 'Species') : null,
      tags: [
        ...new Map(
          tags.map((value) => {
            const name = text(value, 'Tag', true, 100)!;
            return [name.toLowerCase(), name];
          }),
        ).values(),
      ],
    },
  };
}
export async function verificationQueue(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Input,
) {
  const scope = await service.organization(request, query.organizationId);
  await service.requirePermission(request, scope, 'verify_captures');
  const { size, offset } = paging(query);
  const status = query.status || 'unprocessed';
  if (!['unprocessed', 'approved', 'rejected', 'all'].includes(String(status)))
    throw new DomainError(400, 'Invalid review status');
  const session = query.sessionId ? uuid(query.sessionId, 'Session') : null;
  const start = date(query.startDate),
    end = date(query.endDate);
  if (start && end && start > end)
    throw new DomainError(400, 'End date must follow start date');
  const search = (text(query.search, 'Search', false, 160) ?? '').toLowerCase();
  const result = await service.pool.query(
    `SELECT r.id,r.reference_id,r.image_url,r.lat,r.lon,r.gps_accuracy,r.note,r.extra_attributes,r.captured_at,r.status,r.rejection_reason,
    r.updated_at::text AS updated_at,r.session_id,s.project_id,o.id AS organization_id,o.org_name AS organization_name,
    nullif(trim(concat_ws(' ',g.first_name,g.last_name)),'') AS grower_name,g.id AS grower_account_id,s.device_configuration_id,
    c.id AS processed_capture_id,c.tree_id,(r.status='unprocessed' AND c.id IS NULL) AS can_review,
    (r.status='unprocessed' AND c.id IS NULL AND g.id IS NOT NULL AND s.device_configuration_id IS NOT NULL
      AND r.lat BETWEEN -90 AND 90 AND r.lon BETWEEN -180 AND 180 AND (r.gps_accuracy IS NULL OR r.gps_accuracy BETWEEN 0 AND 32767)) AS can_approve
    FROM field_data.raw_capture r JOIN field_data.session s ON s.id=r.session_id
    JOIN stakeholder.stakeholder o ON lower(o.type)='organization' AND (s.organization_id=o.id::text OR s.organization_id=o.entity_id::text)
    LEFT JOIN field_data.wallet_registration w ON w.id=s.originating_wallet_registration_id
    LEFT JOIN treetracker.grower_account g ON g.id=w.grower_account_id
    LEFT JOIN treetracker.capture c ON c.id=r.id
    WHERE ($1::uuid IS NULL OR o.id=$1) AND ($2='all' OR r.status=$2) AND ($3::uuid IS NULL OR s.id=$3)
      AND ($4='' OR strpos(lower(concat_ws(' ',g.first_name,g.last_name,o.org_name,r.id::text,s.id::text,r.note)),$4)>0)
      AND ($5::date IS NULL OR r.captured_at>=$5::date) AND ($6::date IS NULL OR r.captured_at<($6::date+1))
    ORDER BY s.created_at DESC,s.id,r.captured_at,r.id LIMIT $7 OFFSET $8`,
    [scope, status, session, search, start, end, size + 1, offset],
  );
  return {
    rows: result.rows.slice(0, size),
    hasNext: result.rows.length > size,
  };
}
export async function verifyCaptures(
  service: AdminDomainService,
  request: KeycloakRequest,
  body: Input,
) {
  const input = verificationInput(body),
    actor = uuid(request.user?.id, 'Reviewer');
  const scope = await service.organization(request, body.organizationId);
  await service.requirePermission(request, scope, 'verify_captures');
  const hash = createHash('sha256')
    .update(JSON.stringify({ input, actor, scope }))
    .digest('hex');
  const c = await service.pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'verify:' + input.requestId,
    ]);
    const prior = await c.query(
      'SELECT request_hash FROM field_data.capture_verification WHERE request_id=$1',
      [input.requestId],
    );
    if (prior.rowCount) {
      if (
        prior.rows.some((x) => x.request_hash !== hash) ||
        prior.rowCount !== input.captures.length
      )
        throw new DomainError(
          409,
          'Request ID was already used for another decision',
        );
      await c.query('COMMIT');
      return {
        reviewed: prior.rowCount,
        decision: input.decision,
        replayed: true,
      };
    }
    const rows = await c.query(
      `SELECT r.*,r.updated_at::text AS version,
      (r.updated_at IS NOT DISTINCT FROM wanted.updated_at) AS version_matches,
      s.device_configuration_id,w.grower_account_id,o.id AS organization_id
      FROM jsonb_to_recordset($1::jsonb) AS wanted(id uuid,updated_at timestamptz)
      JOIN field_data.raw_capture r ON r.id=wanted.id JOIN field_data.session s ON s.id=r.session_id
      JOIN stakeholder.stakeholder o ON lower(o.type)='organization' AND (s.organization_id=o.id::text OR s.organization_id=o.entity_id::text)
      LEFT JOIN field_data.wallet_registration w ON w.id=s.originating_wallet_registration_id
      WHERE ($2::uuid IS NULL OR o.id=$2) ORDER BY r.id FOR UPDATE OF r`,
      [JSON.stringify(input.captures), scope],
    );
    if (rows.rowCount !== input.captures.length)
      throw new DomainError(
        404,
        'One or more captures are outside this organization or unavailable',
      );
    if (
      rows.rows.some(
        (row) => !row.version_matches || row.status !== 'unprocessed',
      )
    )
      throw new DomainError(
        409,
        'A selected capture was already reviewed or changed. Refresh the queue.',
      );
    const ids = rows.rows.map((row) => row.id);
    if (
      (
        await c.query(
          'SELECT id FROM treetracker.capture WHERE id=ANY($1::uuid[]) OR reference_id=ANY($2::bigint[]) LIMIT 1',
          [ids, rows.rows.map((row) => row.reference_id)],
        )
      ).rowCount
    )
      throw new DomainError(
        409,
        'A selected capture is already processed and needs reconciliation',
      );
    if (
      input.annotations.species_id &&
      !(
        await c.query(
          'SELECT id FROM herbarium.species WHERE id=$1 AND NOT is_hidden',
          [input.annotations.species_id],
        )
      ).rowCount
    )
      throw new DomainError(400, 'Species is unavailable');
    if (input.decision === 'approved') {
      for (const row of rows.rows) {
        if (
          !row.grower_account_id ||
          !row.device_configuration_id ||
          row.lat == null ||
          row.lon == null ||
          !Number.isFinite(Number(row.lat)) ||
          !Number.isFinite(Number(row.lon)) ||
          Number(row.lat) < -90 ||
          Number(row.lat) > 90 ||
          Number(row.lon) < -180 ||
          Number(row.lon) > 180 ||
          (row.gps_accuracy != null &&
            (!Number.isFinite(Number(row.gps_accuracy)) ||
              Number(row.gps_accuracy) < 0 ||
              Number(row.gps_accuracy) > 32767))
        )
          throw new DomainError(
            400,
            'Approval requires a linked grower, device and valid capture coordinates / GPS accuracy',
          );
        if (!Number.isSafeInteger(Number(row.reference_id)))
          throw new DomainError(
            400,
            'Capture reference cannot be represented safely by the downstream event contract',
          );
      }
    }
    const metadata = JSON.stringify(
      rows.rows.map((row) => ({
        id: row.id,
        organization_id: row.organization_id,
        device_configuration_id: row.device_configuration_id,
        grower_account_id: row.grower_account_id,
        version: row.version,
        audit_id: randomUUID(),
        event_id: randomUUID(),
      })),
    );
    if (input.decision === 'approved') {
      await c.query(
        `INSERT INTO treetracker.capture(id,reference_id,image_url,lat,lon,gps_accuracy,note,attributes,
        estimated_geometric_location,estimated_geographic_location,device_configuration_id,session_id,grower_account_id,
        planting_organization_id,species_id,morphology,age,captured_at,updated_at)
        SELECT r.id,r.reference_id,r.image_url,r.lat,r.lon,round(r.gps_accuracy)::smallint,r.note,r.extra_attributes,
        public.ST_SetSRID(public.ST_MakePoint(r.lon::double precision,r.lat::double precision),4326),
        public.ST_SetSRID(public.ST_MakePoint(r.lon::double precision,r.lat::double precision),4326)::public.geography,
        m.device_configuration_id,r.session_id,m.grower_account_id,m.organization_id,$2::uuid,$3,$4::integer,r.captured_at,clock_timestamp()
        FROM jsonb_to_recordset($1::jsonb) AS m(id uuid,organization_id uuid,device_configuration_id uuid,grower_account_id uuid)
        JOIN field_data.raw_capture r ON r.id=m.id`,
        [
          metadata,
          input.annotations.species_id,
          input.annotations.morphology,
          input.annotations.age,
        ],
      );
      if (input.annotations.tags.length) {
        // The same names are resolved once per organization, never once per capture.
        const orgs = [
          ...new Set<string>(rows.rows.map((row) => row.organization_id)),
        ].sort();
        for (const org of orgs)
          await c.query(
            'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
            ['verify-org:' + org],
          );
        const desired = JSON.stringify(
          orgs.flatMap((owner_id) =>
            input.annotations.tags.map((name) => ({
              id: randomUUID(),
              owner_id,
              name,
            })),
          ),
        );
        await c.query(
          `INSERT INTO treetracker.tag(id,name,"isPublic",owner_id)
          SELECT d.id,d.name,false,d.owner_id FROM jsonb_to_recordset($1::jsonb) AS d(id uuid,owner_id text,name text)
          WHERE NOT EXISTS(SELECT 1 FROM treetracker.tag t WHERE t.owner_id=d.owner_id AND lower(t.name)=lower(d.name) AND t.status='active')
          ON CONFLICT(name,owner_id) DO UPDATE SET status='active',"isPublic"=false,updated_at=clock_timestamp()`,
          [desired],
        );
        await c.query(
          `WITH available AS (
          SELECT DISTINCT ON (t.owner_id,lower(t.name)) t.id,t.owner_id FROM treetracker.tag t
          JOIN jsonb_to_recordset($2::jsonb) AS d(owner_id text,name text) ON t.owner_id=d.owner_id AND lower(t.name)=lower(d.name)
          WHERE t.status='active' ORDER BY t.owner_id,lower(t.name),t.id)
          INSERT INTO treetracker.capture_tag(capture_id,tag_id)
          SELECT m.id,t.id FROM jsonb_to_recordset($1::jsonb) AS m(id uuid,organization_id uuid)
          JOIN available t ON t.owner_id=m.organization_id::text`,
          [metadata, desired],
        );
      }
      await c.query(
        `INSERT INTO treetracker.domain_event(id,payload,status,created_at,updated_at)
        SELECT m.event_id,jsonb_build_object('id',c.id,'reference_id',c.reference_id,'approved',true,'type','CaptureCreated',
          'lat',c.lat,'lon',c.lon,'grower_account_id',c.grower_account_id,'attributes',c.attributes,'captured_at',c.captured_at),
          'raised',now(),now() FROM jsonb_to_recordset($1::jsonb) AS m(id uuid,event_id uuid)
          JOIN treetracker.capture c ON c.id=m.id`,
        [metadata],
      );
    }
    await c.query(
      'UPDATE field_data.raw_capture SET status=$2,rejection_reason=$3,updated_at=clock_timestamp() WHERE id=ANY($1::uuid[])',
      [
        ids,
        input.decision,
        input.decision === 'rejected' ? input.reason : null,
      ],
    );
    await c.query(
      `INSERT INTO field_data.capture_verification(id,request_id,request_hash,capture_id,organization_id,reviewer_id,decision,rejection_reason,annotations,previous_updated_at)
      SELECT m.audit_id,$2::uuid,$3,m.id,m.organization_id,$4::uuid,$5,$6,$7::jsonb,m.version
      FROM jsonb_to_recordset($1::jsonb) AS m(id uuid,organization_id uuid,audit_id uuid,version timestamptz)`,
      [
        metadata,
        input.requestId,
        hash,
        actor,
        input.decision,
        input.reason,
        JSON.stringify(input.annotations),
      ],
    );
    await c.query('COMMIT');
    return {
      reviewed: rows.rowCount,
      decision: input.decision,
      matching:
        input.decision === 'approved'
          ? 'CaptureCreated events recorded; matching publication remains pending'
          : undefined,
    };
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally {
    c.release();
  }
}
