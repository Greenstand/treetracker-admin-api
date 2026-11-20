import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, uuid } from './validation';
import { subscriptionPlans } from './plans';
interface Customer {
  id: string;
  metadata: Record<string, string>;
}
interface Subscription {
  id: string;
  status: string;
  items: { data: { id: string; quantity: number; price: { id: string } }[] };
}
async function stripe<T>(
  method: string,
  path: string,
  data?: URLSearchParams,
  idempotencyKey?: string,
): Promise<T> {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new DomainError(503, 'Stripe billing is not configured');
  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
  };
  if (data) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const response = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers,
    body: data,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new DomainError(503, 'Stripe could not open this billing operation');
  return response.json() as Promise<T>;
}
async function billingOrganization(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Record<string, unknown>,
) {
  if (
    !request.user?.policy.policies.some((role) =>
      ['greenstand-admin', 'org-admin-saas'].includes(role.name),
    )
  ) {
    throw new DomainError(
      403,
      'An organization administrator must manage billing',
    );
  }
  const id = await service.organization(request, query.organizationId, true);
  const result = await service.pool.query(
    'SELECT id,entity_id,org_name FROM stakeholder.stakeholder WHERE id=$1',
    [id],
  );
  const org = result.rows[0];
  if (!org.entity_id)
    throw new DomainError(
      409,
      'Organization membership mapping is required before subscribing',
    );
  return org;
}
async function existingCustomer(organizationId: number) {
  const query = new URLSearchParams({
    query: "metadata['organization_id']:'" + organizationId + "'",
    limit: '2',
  });
  const result = await stripe<{ data: Customer[]; has_more: boolean }>(
    'GET',
    '/customers/search?' + query,
  );
  if (result.data.length > 1 || result.has_more)
    throw new DomainError(
      409,
      'Multiple Stripe customers need billing reconciliation',
    );
  return result.data[0];
}
async function subscriptions(customerId: string) {
  const query = new URLSearchParams({
    customer: customerId,
    status: 'all',
    limit: '100',
  });
  const result = await stripe<{ data: Subscription[]; has_more: boolean }>(
    'GET',
    '/subscriptions?' + query,
  );
  if (result.has_more)
    throw new DomainError(
      409,
      'Subscription history needs billing reconciliation',
    );
  return result.data.filter(
    (sub) => !['canceled', 'incomplete_expired'].includes(sub.status),
  );
}
export async function billingStatus(
  service: AdminDomainService,
  request: KeycloakRequest,
  query: Record<string, unknown>,
) {
  const org = await billingOrganization(service, request, query),
    customer = await existingCustomer(org.entity_id);
  if (!customer) return { status: 'No subscription', plan: null };
  const current = (await subscriptions(customer.id))[0];
  if (!current) return { status: 'No subscription', plan: null };
  const plan = subscriptionPlans.find((tier) =>
    current.items.data.some((item) => item.price.id === tier.priceId),
  );
  return { status: current.status, plan: plan?.name ?? 'Unmapped plan' };
}
export async function openBilling(
  service: AdminDomainService,
  request: KeycloakRequest,
  body: Record<string, unknown>,
) {
  const org = await billingOrganization(service, request, body);
  const plan = subscriptionPlans.find((tier) => tier.name === body.tier);
  if (!plan) throw new DomainError(400, 'Choose a configured tier');
  const requestId = uuid(body.requestId, 'Request');
  const returnUrl = process.env.STRIPE_RETURN_URL;
  if (!returnUrl)
    throw new DomainError(503, 'The Stripe return URL is not configured');
  let target: URL;
  try {
    target = new URL(returnUrl);
  } catch {
    throw new DomainError(503, 'The Stripe return URL is invalid');
  }
  if (
    target.protocol !== 'https:' &&
    !(
      target.protocol === 'http:' &&
      ['127.0.0.1', 'localhost'].includes(target.hostname)
    )
  ) {
    throw new DomainError(503, 'The Stripe return URL must use HTTPS');
  }
  const lock = await service.pool.connect();
  try {
    await lock.query('BEGIN');
    await lock.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'billing:' + org.id,
    ]);
    let customer = await existingCustomer(org.entity_id);
    if (!customer) {
      customer = await stripe<Customer>(
        'POST',
        '/customers',
        new URLSearchParams({
          name: org.org_name,
          email: request.user?.email ?? '',
          'metadata[organization_id]': String(org.entity_id),
          'metadata[organization_uuid]': org.id,
          'metadata[keycloak_user_id]': request.user?.id ?? '',
        }),
        'organization-customer:' + org.id,
      );
    }
    if (
      customer.metadata.organization_uuid &&
      customer.metadata.organization_uuid !== org.id
    ) {
      throw new DomainError(
        409,
        'Stripe customer organization UUID needs reconciliation',
      );
    }
    const active = await subscriptions(customer.id);
    if (active.length > 1)
      throw new DomainError(
        409,
        'Multiple subscriptions need billing reconciliation',
      );
    if (active.length) {
      const current = active[0],
        item = current.items.data.find((entry) =>
          subscriptionPlans.some((tier) => tier.priceId === entry.price.id),
        );
      if (!item)
        throw new DomainError(
          409,
          'The existing subscription tier needs billing reconciliation',
        );
      const params = new URLSearchParams({
        customer: customer.id,
        return_url: returnUrl,
      });
      if (['active', 'trialing'].includes(current.status)) {
        params.set('flow_data[type]', 'subscription_update_confirm');
        params.set(
          'flow_data[subscription_update_confirm][subscription]',
          current.id,
        );
        params.set(
          'flow_data[subscription_update_confirm][items][0][id]',
          item.id,
        );
        params.set(
          'flow_data[subscription_update_confirm][items][0][price]',
          plan.priceId,
        );
        params.set(
          'flow_data[subscription_update_confirm][items][0][quantity]',
          String(item.quantity ?? 1),
        );
      }
      const portal = await stripe<{ url: string }>(
        'POST',
        '/billing_portal/sessions',
        params,
        'organization-portal:' + org.id + ':' + requestId,
      );
      await lock.query('COMMIT');
      return { url: portal.url, flow: 'portal' };
    }
    const pending = await stripe<{
      data: { url: string; metadata: Record<string, string> }[];
      has_more: boolean;
    }>(
      'GET',
      '/checkout/sessions?' +
        new URLSearchParams({
          customer: customer.id,
          status: 'open',
          limit: '100',
        }),
    );
    const owned = pending.data.filter(
      (session) => session.metadata.organization_uuid === org.id,
    );
    if (pending.has_more || owned.length > 1)
      throw new DomainError(
        409,
        'Pending checkouts need billing reconciliation',
      );
    if (owned.length) {
      if (owned[0].metadata.tier !== plan.name)
        throw new DomainError(
          409,
          'An organization checkout is already open. Complete it before choosing another tier.',
        );
      await lock.query('COMMIT');
      return { url: owned[0].url, flow: 'checkout' };
    }
    const params = new URLSearchParams({
      mode: 'subscription',
      customer: customer.id,
      client_reference_id: org.id,
      success_url:
        returnUrl +
        (returnUrl.includes('?') ? '&' : '?') +
        'session_id={CHECKOUT_SESSION_ID}',
      cancel_url: returnUrl,
      'line_items[0][price]': plan.priceId,
      'line_items[0][quantity]': '1',
      'metadata[organization_id]': String(org.entity_id),
      'metadata[organization_uuid]': org.id,
      'metadata[tier]': plan.name,
      'subscription_data[metadata][organization_id]': String(org.entity_id),
      'subscription_data[metadata][organization_uuid]': org.id,
      'subscription_data[metadata][keycloak_user_id]':
        customer.metadata.keycloak_user_id || request.user?.id || '',
    });
    const checkout = await stripe<{ url: string }>(
      'POST',
      '/checkout/sessions',
      params,
      'organization-checkout:' + org.id + ':' + requestId,
    );
    await lock.query('COMMIT');
    return { url: checkout.url, flow: 'checkout' };
  } catch (error) {
    await lock.query('ROLLBACK');
    throw error;
  } finally {
    lock.release();
  }
}
