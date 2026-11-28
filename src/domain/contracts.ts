import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, uuid, text, count, paging } from './validation';
const transitions: Record<string, string[]> = {
  unsigned: ['signed', 'aborted'],
  signed: ['completed', 'cancelled'],
};
export function contractTransition(from: string, to: string) {
  if (!(transitions[from] || []).includes(to))
    throw new DomainError(
      409,
      'This contract status transition is not allowed',
    );
}
function manager(req: KeycloakRequest, platformOnly = false) {
  const roles = platformOnly
    ? ['greenstand-admin']
    : ['greenstand-admin', 'org-admin-saas'];
  if (!req.user?.policy.policies.some((p) => roles.includes(p.name)))
    throw new DomainError(403, 'Contract management permission is required');
  return uuid(req.user.id, 'Reviewer');
}
export async function contractOptions(
  s: AdminDomainService,
  req: KeycloakRequest,
  q: Record<string, unknown>,
) {
  manager(req);
  const org = await s.organization(req, q.organizationId, true);
  const agreements = await s.pool.query(
    "SELECT id,name,status,max_captures FROM contracts.agreement WHERE listed AND status='open' AND growing_organization_id=$1 ORDER BY name",
    [org],
  );
  return { agreements: agreements.rows };
}
export async function workerVerification(
  s: AdminDomainService,
  req: KeycloakRequest,
  id: string,
  body?: Record<string, unknown>,
) {
  const actor = manager(req, true),
    grower = uuid(id);
  if (!body)
    return {
      rows: (
        await s.pool.query(
          'SELECT * FROM contracts.worker_verification WHERE grower_account_id=$1 ORDER BY recorded_at DESC,id DESC LIMIT 25',
          [grower],
        )
      ).rows,
    };
  const outcome = text(body.outcome, 'Outcome', true);
  if (!['approved', 'rejected'].includes(outcome!))
    throw new DomainError(400, 'Choose approved or rejected');
  const date = text(body.verified_at, 'Verification date', true);
  if (
    !date ||
    !Number.isFinite(Date.parse(date)) ||
    Date.parse(date) > Date.now()
  )
    throw new DomainError(400, 'Use a valid verification date in the past');
  const c = await s.pool.connect();
  try {
    await c.query('BEGIN');
    if (
      !(
        await c.query(
          'SELECT id FROM treetracker.grower_account WHERE id=$1 FOR UPDATE',
          [grower],
        )
      ).rowCount
    )
      throw new DomainError(404, 'Grower not found');
    const r = await c.query(
      `INSERT INTO contracts.worker_verification(grower_account_id,outcome,registered_name,provider,account_reference,transaction_reference,verified_at,reviewed_by,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        grower,
        outcome,
        text(body.registered_name, 'Registered name', true, 200),
        text(body.provider, 'Provider', true, 100),
        text(body.account_reference, 'Account reference', true, 120),
        text(
          body.transaction_reference,
          'Payment transaction reference',
          true,
          120,
        ),
        date,
        actor,
        text(body.reason, 'Review notes', true, 2000),
      ],
    );
    await c.query('COMMIT');
    return r.rows[0];
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
export async function saveContract(
  s: AdminDomainService,
  req: KeycloakRequest,
  id: string | undefined,
  body: Record<string, unknown>,
) {
  const actor = manager(req),
    org = await s.organization(req, body.organizationId, true),
    reason = text(body.reason, 'Reason', true, 2000);
  const c = await s.pool.connect();
  try {
    await c.query('BEGIN');
    let row;
    if (!id) {
      const project = uuid(body.project_id, 'Project'),
        grower = uuid(body.grower_account_id, 'Grower'),
        agreement = uuid(body.agreement_id, 'Agreement'),
        quota = count(body.capture_quota);
      if (!quota) throw new DomainError(400, 'Capture quota must be positive');
      if (
        !(
          await c.query(
            "SELECT id FROM stakeholder.project WHERE id=$1 AND organization_id=$2 AND status='active' FOR SHARE",
            [project, org],
          )
        ).rowCount
      )
        throw new DomainError(
          400,
          'Choose an active project in this organization',
        );
      if (
        !(
          await c.query(
            "SELECT id FROM contracts.agreement WHERE id=$1 AND growing_organization_id=$2 AND status='open' AND listed FOR SHARE",
            [agreement, org],
          )
        ).rowCount
      )
        throw new DomainError(
          400,
          'Choose an open agreement in this organization',
        );
      if (
        !(
          await c.query(
            'SELECT id FROM treetracker.grower_account WHERE id=$1 AND organization_id=$2 FOR SHARE',
            [grower, org],
          )
        ).rowCount
      )
        throw new DomainError(400, 'Grower must belong to this organization');
      row = (
        await c.query(
          `INSERT INTO contracts.contract(agreement_id,worker_id,grower_account_id,project_id,capture_quota,notes) VALUES($1,$2,$2,$3,$4,$5) RETURNING *`,
          [
            agreement,
            grower,
            project,
            quota,
            text(body.notes, 'Notes', false, 2000),
          ],
        )
      ).rows[0];
      await c.query(
        'INSERT INTO contracts.contract_event(contract_id,actor_id,reason,status) VALUES($1,$2,$3,$4)',
        [row.id, actor, reason, row.status],
      );
    } else {
      row = (
        await c.query(
          `SELECT c.* FROM contracts.contract c JOIN contracts.agreement a ON a.id=c.agreement_id WHERE c.id=$1 AND c.listed AND a.growing_organization_id=$2 FOR UPDATE OF c`,
          [uuid(id), org],
        )
      ).rows[0];
      if (!row) throw new DomainError(404, 'Contract not found');
      if (row.status !== body.expected_status)
        throw new DomainError(
          409,
          'Contract changed. Refresh before trying again',
        );
      const status = text(body.status, 'Status', true)!;
      contractTransition(row.status, status);
      let verification = null;
      if (status === 'signed') {
        if (!row.project_id || !row.grower_account_id || !row.capture_quota)
          throw new DomainError(
            409,
            'Project, grower and quota must be linked before signing',
          );
        await c.query(
          'SELECT id FROM treetracker.grower_account WHERE id=$1 FOR UPDATE',
          [row.grower_account_id],
        );
        const v = (
          await c.query(
            'SELECT id,outcome FROM contracts.worker_verification WHERE grower_account_id=$1 ORDER BY recorded_at DESC,id DESC LIMIT 1',
            [row.grower_account_id],
          )
        ).rows[0];
        if (v?.outcome !== 'approved')
          throw new DomainError(
            409,
            'Manual worker approval is required before signing',
          );
        verification = v.id;
      }
      await c.query(
        `UPDATE contracts.contract SET status=$2::varchar,signed_at=CASE WHEN $2::varchar='signed' THEN now() ELSE signed_at END,closed_at=CASE WHEN $2::varchar IN ('completed','cancelled','aborted') THEN now() ELSE closed_at END WHERE id=$1`,
        [row.id, status],
      );
      await c.query(
        'INSERT INTO contracts.contract_event(contract_id,actor_id,reason,previous_status,status,verification_id) VALUES($1,$2,$3,$4,$5,$6)',
        [row.id, actor, reason, row.status, status, verification],
      );
    }
    await c.query('COMMIT');
    return { id: row.id };
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
export async function contractHistory(
  s: AdminDomainService,
  req: KeycloakRequest,
  id: string,
) {
  const org = await s.organization(req);
  await s.requirePermission(req, org, 'view_contracts');
  return {
    rows: (
      await s.pool.query(
        `SELECT e.* FROM contracts.contract_event e JOIN contracts.contract c ON c.id=e.contract_id JOIN contracts.agreement a ON a.id=c.agreement_id WHERE c.id=$1 AND ($2::uuid IS NULL OR a.growing_organization_id=$2) ORDER BY e.created_at DESC,e.id DESC`,
        [uuid(id), org],
      )
    ).rows,
  };
}

export async function agreements(
  s: AdminDomainService,
  req: KeycloakRequest,
  q: Record<string, unknown>,
) {
  const org = await s.organization(req, q.organizationId);
  await s.requirePermission(req, org, 'view_contracts');
  const { size, offset } = paging(q),
    search = (text(q.search, 'Search', false, 160) || '').toLowerCase();
  return s.page(
    (
      await s.pool.query(
        `SELECT a.id,a.name,a.description,a.type,a.status,a.max_captures,a.capture_payment,a.capture_payment_currency,a.opened_at,a.closed_at,a.growing_organization_id AS organization_id,o.org_name AS organization_name,r.name AS consolidation_rule_name,(SELECT count(*)::int FROM contracts.contract c WHERE c.agreement_id=a.id AND c.listed) AS contract_count FROM contracts.agreement a LEFT JOIN stakeholder.stakeholder o ON o.id=a.growing_organization_id LEFT JOIN contracts.consolidation_rule r ON r.id=a.consolidation_rule_id WHERE a.listed AND ($1::uuid IS NULL OR a.growing_organization_id=$1 OR a.owner_id=$1) AND ($2='' OR strpos(lower(concat_ws(' ',a.name,a.description,o.org_name)),$2)>0) ORDER BY a.created_at DESC,a.id LIMIT $3 OFFSET $4`,
        [org, search, size + 1, offset],
      )
    ).rows,
    size,
  );
}

export async function agreementOptions(
  s: AdminDomainService,
  req: KeycloakRequest,
  q: Record<string, unknown>,
) {
  manager(req);
  const org = await s.organization(req, q.organizationId, true),
    platform = req.user!.policy.policies.some(
      (p) => p.name === 'greenstand-admin',
    );
  const rules = await s.pool.query(
    `SELECT r.id,r.name FROM contracts.consolidation_rule r WHERE r.listed AND ($2::boolean OR r.owner_id=$1 OR EXISTS(SELECT 1 FROM contracts.agreement a WHERE a.growing_organization_id=$1 AND a.consolidation_rule_id=r.id AND a.listed)) ORDER BY r.name`,
    [org, platform],
  );
  const funders = await s.pool.query(
    `SELECT o.id,o.org_name AS name FROM stakeholder.stakeholder o WHERE o.active AND lower(o.type)='organization' AND (o.id=$1 OR EXISTS(SELECT 1 FROM contracts.agreement a WHERE a.growing_organization_id=$1 AND a.funder_id=o.id AND a.listed)) ORDER BY o.org_name`,
    [org],
  );
  return { rules: rules.rows, funders: funders.rows };
}
export async function saveAgreement(
  s: AdminDomainService,
  req: KeycloakRequest,
  id: string | undefined,
  body: Record<string, unknown>,
) {
  const actor = manager(req),
    org = await s.organization(req, body.organizationId, true),
    reason = text(body.reason, 'Reason', true, 2000),
    c = await s.pool.connect();
  try {
    await c.query('BEGIN');
    let row,
      previous = null;
    if (!id) {
      const name = text(body.name, 'Agreement name', true, 200),
        description = text(body.description, 'Description', false, 4000),
        funder = uuid(body.funder_id, 'Funder'),
        rule = uuid(body.consolidation_rule_id, 'Earnings rule'),
        quota = count(body.max_captures),
        currency = text(body.capture_payment_currency, 'Currency', true, 3);
      if (!['USD', 'SLL'].includes(currency!))
        throw new DomainError(
          400,
          'Choose a currency supported by the contracts service',
        );
      const rate = text(body.capture_payment, 'Payment per capture', true, 30);
      if (!rate || !/^\d+(\.\d{1,6})?$/.test(rate) || Number(rate) <= 0)
        throw new DomainError(
          400,
          'Payment per capture must be a positive amount with at most six decimals',
        );
      if (!quota)
        throw new DomainError(400, 'Default capture quota must be positive');
      const platform = req.user!.policy.policies.some(
        (p) => p.name === 'greenstand-admin',
      );
      if (
        !(
          await c.query(
            `SELECT r.id FROM contracts.consolidation_rule r WHERE r.id=$1 AND r.listed AND ($3::boolean OR r.owner_id=$2 OR EXISTS(SELECT 1 FROM contracts.agreement a WHERE a.growing_organization_id=$2 AND a.consolidation_rule_id=r.id AND a.listed)) FOR SHARE OF r`,
            [rule, org, platform],
          )
        ).rowCount
      )
        throw new DomainError(
          400,
          'Choose an authorized earnings calculation rule',
        );
      if (
        !(
          await c.query(
            `SELECT o.id FROM stakeholder.stakeholder o WHERE o.id=$1 AND o.active AND lower(o.type)='organization' AND (o.id=$2 OR EXISTS(SELECT 1 FROM contracts.agreement a WHERE a.growing_organization_id=$2 AND a.funder_id=o.id AND a.listed)) FOR SHARE OF o`,
            [funder, org],
          )
        ).rowCount
      )
        throw new DomainError(400, 'Choose an authorized funding organization');
      row = (
        await c.query(
          `INSERT INTO contracts.agreement(type,owner_id,funder_id,growing_organization_id,consolidation_rule_id,name,description,capture_payment,capture_payment_currency,max_captures) VALUES('grower',$1,$2,$1,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [org, funder, rule, name, description, rate, currency, quota],
        )
      ).rows[0];
    } else {
      row = (
        await c.query(
          `SELECT * FROM contracts.agreement WHERE id=$1 AND growing_organization_id=$2 AND listed FOR UPDATE`,
          [uuid(id), org],
        )
      ).rows[0];
      if (!row) throw new DomainError(404, 'Agreement not found');
      if (row.status !== body.expected_status)
        throw new DomainError(
          409,
          'Agreement changed. Refresh before trying again',
        );
      const target = text(body.status, 'Status', true)!;
      if (
        !(
          { planning: ['open', 'aborted'], open: ['closed'] }[row.status] || []
        ).includes(target)
      )
        throw new DomainError(
          409,
          'This agreement status transition is not allowed',
        );
      if (
        target === 'open' &&
        (!row.capture_payment ||
          Number(row.capture_payment) <= 0 ||
          !row.capture_payment_currency ||
          !row.max_captures)
      )
        throw new DomainError(
          409,
          'Payment terms and quota must be set before opening',
        );
      previous = row.status;
      row = (
        await c.query(
          `UPDATE contracts.agreement SET status=$2::varchar,opened_at=CASE WHEN $2::varchar='open' THEN now() ELSE opened_at END,closed_at=CASE WHEN $2::varchar IN ('closed','aborted') THEN now() ELSE closed_at END WHERE id=$1 RETURNING *`,
          [row.id, target],
        )
      ).rows[0];
    }
    await c.query(
      'INSERT INTO contracts.agreement_event(agreement_id,actor_id,reason,previous_status,status,terms) VALUES($1,$2,$3,$4,$5,$6)',
      [row.id, actor, reason, previous, row.status, JSON.stringify(row)],
    );
    await c.query('COMMIT');
    return { id: row.id };
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
export async function agreementHistory(
  s: AdminDomainService,
  req: KeycloakRequest,
  id: string,
) {
  const org = await s.organization(req);
  await s.requirePermission(req, org, 'view_contracts');
  return {
    rows: (
      await s.pool.query(
        `SELECT e.id,e.actor_id,e.created_at,e.reason,e.previous_status,e.status FROM contracts.agreement_event e JOIN contracts.agreement a ON a.id=e.agreement_id WHERE a.id=$1 AND ($2::uuid IS NULL OR a.growing_organization_id=$2 OR a.owner_id=$2) ORDER BY e.created_at DESC,e.id DESC`,
        [uuid(id), org],
      )
    ).rows,
  };
}
