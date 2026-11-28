export const subscriptionPlans = [
  {
    name: 'Seed',
    priceId: process.env.STRIPE_PRICE_SEED || 'price_1Tl08WGmNPVjwaUK3CmkVYSh',
    seats: 1,
    captures: 5000,
    growers: 10,
    projects: 1,
    wallet: false,
    contracts: false,
    proposed: false,
  },
  {
    name: 'Root',
    priceId: process.env.STRIPE_PRICE_ROOT || 'price_1Tl0ARGmNPVjwaUKAcknPXis',
    seats: 3,
    captures: 50000,
    growers: 100,
    projects: 5,
    wallet: false,
    contracts: false,
    proposed: true,
  },
  {
    name: 'Base',
    priceId: process.env.STRIPE_PRICE_BASE || 'price_1Tl0C7GmNPVjwaUKGsnSveav',
    seats: 10,
    captures: 250000,
    growers: 1000,
    projects: 20,
    wallet: true,
    contracts: true,
    proposed: true,
  },
  {
    name: 'Crown',
    priceId: process.env.STRIPE_PRICE_CROWN || 'price_1Tl0DGGmNPVjwaUKFszdG7t4',
    seats: 25,
    captures: 1000000,
    growers: 5000,
    projects: 100,
    wallet: true,
    contracts: true,
    proposed: true,
  },
];
interface StripePrice {
  unit_amount: number | null;
  currency: string;
  recurring?: { interval: string; interval_count: number };
}
export async function subscriptionPlanCatalog() {
  return Promise.all(
    subscriptionPlans.map(async (plan) => {
      if (!process.env.STRIPE_SECRET_KEY)
        return { ...plan, price: null, priceStatus: 'Billing unavailable' };
      try {
        const response = await fetch(
          'https://api.stripe.com/v1/prices/' +
            encodeURIComponent(plan.priceId),
          {
            headers: {
              Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
            },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok) throw new Error('Stripe price lookup failed');
        const price = (await response.json()) as StripePrice;
        return {
          ...plan,
          price: {
            unitAmount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval,
            intervalCount: price.recurring?.interval_count,
          },
          priceStatus: 'Available',
        };
      } catch {
        return { ...plan, price: null, priceStatus: 'Billing unavailable' };
      }
    }),
  );
}
