import { subscriptionPlanCatalog } from './plans';
describe('Stripe plan price source', () => {
  const originalKey = process.env.STRIPE_SECRET_KEY;
  afterEach(() => {
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalKey;
    jest.restoreAllMocks();
  });
  it('returns allowances with an unavailable price when Stripe is unconfigured', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const plans = await subscriptionPlanCatalog();
    expect(plans[0]).toMatchObject({
      name: 'Seed',
      seats: 1,
      captures: 5000,
      growers: 10,
      projects: 1,
      price: null,
    });
    expect(plans[3].captures).toBe(1000000);
    expect(plans.every((plan) => !('monthlyUsd' in plan))).toBe(true);
  });
  it('uses Stripe amounts and intervals instead of inferring prices from tiers', async () => {
    process.env.STRIPE_SECRET_KEY = 'test-fixture-only';
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        unit_amount: 1234,
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 },
      }),
    } as Response);
    const plans = await subscriptionPlanCatalog();
    expect(plans[0].price).toMatchObject({
      unitAmount: 1234,
      currency: 'usd',
      interval: 'month',
    });
  });
});
