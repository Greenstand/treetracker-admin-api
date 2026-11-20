import { Pool } from 'pg';
import { listSaasAdministrators } from '../services/keycloakAdminService';
import { paging, DomainError } from './validation';
import { subscriptionPlans } from './plans';

const planNames: Record<string, string> = {
  price_1Tl08WGmNPVjwaUK3CmkVYSh: 'Seed',
  price_1Tl0ARGmNPVjwaUKAcknPXis: 'Root',
  price_1Tl0C7GmNPVjwaUKGsnSveav: 'Base',
  price_1Tl0DGGmNPVjwaUKFszdG7t4: 'Crown',
  ...Object.fromEntries(
    subscriptionPlans.map((plan) => [plan.priceId, plan.name]),
  ),
};
interface StripeSubscription {
  id: string;
  status: string;
  cancel_at_period_end?: boolean;
  items: { data: { price: { id: string }; current_period_end?: number }[] };
}
async function stripeOrganizationStatus(organizationId: string) {
  if (!process.env.STRIPE_SECRET_KEY)
    return { status: 'Billing unavailable', plan: null };
  const search = new URLSearchParams({
    query: "metadata['organization_id']:'" + organizationId + "'",
    limit: '100',
  });
  const response = await fetch(
    'https://api.stripe.com/v1/subscriptions/search?' + search,
    {
      headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY },
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok)
    throw new DomainError(503, 'Stripe subscription lookup failed');
  const data = (await response.json()) as {
    data: StripeSubscription[];
    has_more: boolean;
  };
  if (data.has_more)
    throw new DomainError(
      503,
      'Stripe subscription lookup requires reconciliation',
    );
  if (!data.data.length) return { status: 'No subscription', plan: null };
  const ranked = [...data.data].sort(
    (a, b) =>
      Number(['active', 'trialing', 'past_due'].includes(b.status)) -
      Number(['active', 'trialing', 'past_due'].includes(a.status)),
  );
  const selected = ranked[0],
    price = selected.items.data.find((item) => planNames[item.price.id]);
  return {
    status: selected.status,
    plan: price ? planNames[price.price.id] : 'Unmapped plan',
    subscription_id: selected.id,
    cancel_at_period_end: selected.cancel_at_period_end,
    current_period_end: price?.current_period_end
      ? new Date(price.current_period_end * 1000).toISOString()
      : null,
  };
}
export async function saasUsers(pool: Pool, query: Record<string, unknown>) {
  const { size, offset } = paging(query);
  if (query.search)
    throw new DomainError(400, 'Use page-level filtering for SaaS user search');
  const users = await listSaasAdministrators(offset, size + 1);
  const ids = [
    ...new Set(
      users
        .map((user) => user.attributes?.organization_id?.[0])
        .filter((id) => /^[1-9][0-9]*$/.test(id ?? '')),
    ),
  ];
  const organizations = await pool.query(
    `SELECT id,entity_id,org_name FROM stakeholder.stakeholder
    WHERE entity_id::text=ANY($1::text[]) AND lower(type)='organization'`,
    [ids],
  );
  const billing = new Map();
  for (const id of ids) {
    try {
      billing.set(id, await stripeOrganizationStatus(id));
    } catch {
      billing.set(id, { status: 'Billing unavailable', plan: null });
    }
  }
  return {
    hasNext: users.length > size,
    rows: users.slice(0, size).map((user) => {
      const id = user.attributes?.organization_id?.[0],
        org = organizations.rows.find((row) => String(row.entity_id) === id);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        enabled: user.enabled,
        organization_id: org?.id,
        organization_name: org?.org_name ?? 'Unassigned organization',
        registered_at: user.createdTimestamp
          ? new Date(user.createdTimestamp).toISOString()
          : null,
        subscription: id
          ? (billing.get(id) ?? { status: 'Membership unresolved', plan: null })
          : { status: 'No organization', plan: null },
      };
    }),
  };
}
