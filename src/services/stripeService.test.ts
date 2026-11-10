const create = jest.fn();
const retrieve = jest.fn();
const search = jest.fn();

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create, retrieve } },
    subscriptions: { search },
  })),
}));

process.env.STRIPE_SECRET_KEY = 'sk_test_x';
process.env.STRIPE_PRICE_ID = 'price_x';

import {
  createCheckoutSession,
  getStatusByOrganization,
  getStatusBySession,
  isStripeConfigured,
} from './stripeService';

// current_period_end lives on the subscription item in this SDK version.
const subscription = {
  status: 'active',
  items: { data: [{ current_period_end: 1794787200 }] },
};

describe('stripeService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is configured only with both env vars', () => {
    expect(isStripeConfigured()).toBe(true);
  });

  it('tags the subscription with the organization and returns the url', async () => {
    create.mockResolvedValue({ url: 'https://checkout.stripe.test/s' });

    const url = await createCheckoutSession(42, 'https://panel.test/sub');

    expect(url).toBe('https://checkout.stripe.test/s');
    const args = create.mock.calls[0][0];
    expect(args.mode).toBe('subscription');
    expect(args.line_items).toEqual([{ price: 'price_x', quantity: 1 }]);
    expect(args.client_reference_id).toBe('42');
    expect(args.subscription_data.metadata).toEqual({ organization_id: '42' });
    expect(args.success_url).toBe(
      'https://panel.test/sub?session_id={CHECKOUT_SESSION_ID}',
    );
  });

  it('reads status and period end from a session', async () => {
    retrieve.mockResolvedValue({
      client_reference_id: '42',
      subscription,
    });

    expect(await getStatusBySession('cs_1', 42)).toEqual({
      status: 'active',
      currentPeriodEnd: new Date(1794787200 * 1000).toISOString(),
    });
  });

  it('ignores a session belonging to another organization', async () => {
    retrieve.mockResolvedValue({ client_reference_id: '7', subscription });

    expect(await getStatusBySession('cs_1', 42)).toBeNull();
  });

  it('searches by the organization metadata', async () => {
    search.mockResolvedValue({ data: [subscription] });

    const result = await getStatusByOrganization(42);

    expect(search).toHaveBeenCalledWith({
      query: 'metadata["organization_id"]:"42"',
      limit: 1,
    });
    expect(result?.status).toBe('active');
  });

  it('returns null when the organization has no subscription', async () => {
    search.mockResolvedValue({ data: [] });

    expect(await getStatusByOrganization(42)).toBeNull();
  });
});
