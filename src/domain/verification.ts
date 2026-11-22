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
      tags: [...new Set(tags.map((value) => text(value, 'Tag', true, 100)!))],
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
      `SELECT r.*,r.updated_at::text AS version,s.device_configuration_id,w.grower_account_id,o.id AS organization_id
      FROM field_data.raw_capture r JOIN field_data.session s ON s.id=r.session_id
      JOIN stakeholder.stakeholder o ON lower(o.type)='organization' AND (s.organization_id=o.id::text OR s.organization_id=o.entity_id::text)
      LEFT JOIN field_data.wallet_registration w ON w.id=s.originating_wallet_registration_id
      WHERE r.id=ANY($1::uuid[]) AND ($2::uuid IS NULL OR o.id=$2) ORDER BY r.id FOR UPDATE OF r`,
      [input.captures.map((x) => x.id), scope],
    );
    if (rows.rowCount !== input.captures.length)
      throw new DomainError(
        404,
        'One or more captures are outside this organization or unavailable',
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
    for (const org of [
      ...new Set(rows.rows.map((x) => x.organization_id)),
    ].sort())
      await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
        'verify-org:' + org,
      ]);
    for (const row of rows.rows) {
      const supplied = input.captures.find((x) => x.id === row.id)!;
      const fresh = await c.query(
        'SELECT 1 FROM field_data.raw_capture WHERE id=$1 AND updated_at=$2::timestamptz',
        [row.id, supplied.updated_at],
      );
      if (!fresh.rowCount || row.status !== 'unprocessed')
        throw new DomainError(
          409,
          'A selected capture was already reviewed or changed. Refresh the queue.',
        );
      if (
        (
          await c.query(
            'SELECT id FROM treetracker.capture WHERE id=$1 OR reference_id=$2',
            [row.id, row.reference_id],
          )
        ).rowCount
      )
        throw new DomainError(
          409,
          'A selected capture is already processed and needs reconciliation',
        );
      if (input.decision === 'approved') {
        if (
          !row.grower_account_id ||
          !row.device_configuration_id ||
          Number(row.lat) < -90 ||
          Number(row.lat) > 90 ||
          Number(row.lon) < -180 ||
          Number(row.lon) > 180 ||
          (row.gps_accuracy != null &&
            (Number(row.gps_accuracy) < 0 || Number(row.gps_accuracy) > 32767))
        )
          throw new DomainError(
            400,
            'Approval requires a linked grower, device and valid capture coordinates / GPS accuracy',
          );
        await c.query(
          `INSERT INTO treetracker.capture(id,reference_id,image_url,lat,lon,gps_accuracy,note,attributes,
          estimated_geometric_location,estimated_geographic_location,device_configuration_id,session_id,grower_account_id,
          planting_organization_id,species_id,morphology,age,captured_at,updated_at)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,public.ST_SetSRID(public.ST_MakePoint($5::numeric::double precision,$4::numeric::double precision),4326),
          public.ST_SetSRID(public.ST_MakePoint($5::numeric::double precision,$4::numeric::double precision),4326)::public.geography,$9,$10,$11,$12,$13,$14,$15,$16,clock_timestamp())`,
          [
            row.id,
            row.reference_id,
            row.image_url,
            row.lat,
            row.lon,
            row.gps_accuracy == null
              ? null
              : Math.round(Number(row.gps_accuracy)),
            row.note,
            row.extra_attributes,
            row.device_configuration_id,
            row.session_id,
            row.grower_account_id,
            row.organization_id,
            input.annotations.species_id,
            input.annotations.morphology,
            input.annotations.age,
            row.captured_at,
          ],
        );
        for (const name of input.annotations.tags) {
          let tag = (
            await c.query(
              'SELECT id FROM treetracker.tag WHERE lower(name)=lower($1) AND status=\'active\' AND (owner_id=$2 OR "isPublic") ORDER BY (owner_id=$2) DESC NULLS LAST,id LIMIT 1',
              [name, row.organization_id],
            )
          ).rows[0];
          if (!tag)
            tag = (
              await c.query(
                'INSERT INTO treetracker.tag(name,"isPublic",owner_id) VALUES($1,false,$2) RETURNING id',
                [name, row.organization_id],
              )
            ).rows[0];
          await c.query(
            'INSERT INTO treetracker.capture_tag(capture_id,tag_id) VALUES($1,$2)',
            [row.id, tag.id],
          );
        }
        if (!Number.isSafeInteger(Number(row.reference_id)))
          throw new DomainError(
            400,
            'Capture reference cannot be represented safely by the downstream event contract',
          );
        const event = {
          id: row.id,
          reference_id: Number(row.reference_id),
          approved: true,
          type: 'CaptureCreated',
          lat: Number(row.lat),
          lon: Number(row.lon),
          grower_account_id: row.grower_account_id,
          attributes: row.extra_attributes,
          captured_at: row.captured_at,
        };
        await c.query(
          "INSERT INTO treetracker.domain_event(id,payload,status,created_at,updated_at) VALUES($1,$2,'raised',now(),now())",
          [randomUUID(), event],
        );
      }
      await c.query(
        'UPDATE field_data.raw_capture SET status=$2,rejection_reason=$3,updated_at=clock_timestamp() WHERE id=$1',
        [
          row.id,
          input.decision,
          input.decision === 'rejected' ? input.reason : null,
        ],
      );
      await c.query(
        `INSERT INTO field_data.capture_verification(id,request_id,request_hash,capture_id,organization_id,reviewer_id,decision,rejection_reason,annotations,previous_updated_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          randomUUID(),
          input.requestId,
          hash,
          row.id,
          row.organization_id,
          actor,
          input.decision,
          input.reason,
          input.annotations,
          row.version,
        ],
      );
    }
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
