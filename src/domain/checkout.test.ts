import { Pool } from 'pg';
import { AdminDomainService } from './service';
import { openBilling } from './checkout';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const organization = '11111111-2222-4333-8444-555555555555';
const userId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const owner = {
  user: {
    id: userId,
    email: 'fixture@example.org',
    policy: { policies: [{ name: 'org-admin-saas' }] },
  },
} as KeycloakRequest;
const body = {
  organizationId: organization,
  tier: 'Root',
  requestId: 'eeeeeeee-bbbb-4ccc-8ddd-111111111111',
};
describe('Hosted organization billing', () => {
  const originalKey = process.env.STRIPE_SECRET_KEY,
    originalReturn = process.env.STRIPE_RETURN_URL;
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'fixture-only';
    process.env.STRIPE_RETURN_URL =
      'https://panel.example.org/subscription-plans';
  });
  afterEach(() => {
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalKey;
    if (originalReturn === undefined) delete process.env.STRIPE_RETURN_URL;
    else process.env.STRIPE_RETURN_URL = originalReturn;
    jest.restoreAllMocks();
  });
  function setup(active: boolean) {
    const lock = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    const pool = {
      query: jest.fn().mockResolvedValue({
        rows: [{ id: organization, entity_id: 3414, org_name: 'QA' }],
      }),
      connect: jest.fn().mockResolvedValue(lock),
    };
    const service = new AdminDomainService(pool as unknown as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(organization);
    const calls: { path: string; body?: unknown }[] = [];
    jest.spyOn(global, 'fetch').mockImplementation(async (input, options) => {
      const path = new URL(String(input)).pathname;
      calls.push({ path, body: options?.body });
      let result: unknown;
      if (path === '/v1/customers/search')
        result = {
          data: [
            {
              id: 'cus_fixture',
              metadata: {
                organization_uuid: organization,
                keycloak_user_id: userId,
              },
            },
          ],
          has_more: false,
        };
      else if (path === '/v1/subscriptions')
        result = {
          data: active
            ? [
                {
                  id: 'sub_fixture',
                  status: 'active',
                  items: {
                    data: [
                      {
                        id: 'si_fixture',
                        quantity: 1,
                        price: { id: 'price_1Tl08WGmNPVjwaUK3CmkVYSh' },
                      },
                    ],
                  },
                },
              ]
            : [],
          has_more: false,
        };
      else if (path === '/v1/checkout/sessions' && options?.method === 'GET')
        result = { data: [], has_more: false };
      else if (path === '/v1/checkout/sessions')
        result = { url: 'https://checkout.stripe.com/c/pay/fixture' };
      else if (path === '/v1/billing_portal/sessions')
        result = { url: 'https://billing.stripe.com/p/session/fixture' };
      else throw Error('Unexpected Stripe request');
      return { ok: true, json: async () => result } as Response;
    });
    return { service, calls };
  }
  it('denies billing changes to ordinary organization members', async () => {
    const service = new AdminDomainService({} as Pool);
    const verifier = {
      user: { policy: { policies: [{ name: 'org' }] } },
    } as KeycloakRequest;
    await expect(openBilling(service, verifier, body)).rejects.toMatchObject({
      statusCode: 403,
    });
  });
  it('creates first-time Checkout using server-resolved organization metadata', async () => {
    const { service, calls } = setup(false);
    expect((await openBilling(service, owner, body)).flow).toBe('checkout');
    const checkout = calls.find(
      (call) => call.path === '/v1/checkout/sessions' && call.body,
    );
    const params = new URLSearchParams(String(checkout?.body));
    expect(params.get('subscription_data[metadata][organization_id]')).toBe(
      '3414',
    );
    expect(params.get('subscription_data[metadata][organization_uuid]')).toBe(
      organization,
    );
    expect(params.get('success_url')).toContain(
      'https://panel.example.org/subscription-plans',
    );
  });
  it('opens a confirmation portal for an existing subscription', async () => {
    const { service, calls } = setup(true);
    expect((await openBilling(service, owner, body)).flow).toBe('portal');
    expect(calls.some((call) => call.path === '/v1/checkout/sessions')).toBe(
      false,
    );
    const portal = calls.find(
      (call) => call.path === '/v1/billing_portal/sessions',
    );
    const params = new URLSearchParams(String(portal?.body));
    expect(params.get('flow_data[type]')).toBe('subscription_update_confirm');
    expect(
      params.get('flow_data[subscription_update_confirm][subscription]'),
    ).toBe('sub_fixture');
  });
});
