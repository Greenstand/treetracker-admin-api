import Stripe from 'stripe';

export type SubscriptionStatus = {
  status: string;
  currentPeriodEnd: string | null;
};

const ORGANIZATION_METADATA_KEY = 'organization_id';

let stripe: Stripe | undefined;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('env var STRIPE_SECRET_KEY not set');
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

function toStatus(subscription: Stripe.Subscription): SubscriptionStatus {
  const item = subscription.items.data[0];
  return {
    status: subscription.status,
    currentPeriodEnd: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  };
}

export async function createCheckoutSession(
  organizationId: number,
  returnUrl: string,
): Promise<string> {
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error('env var STRIPE_PRICE_ID not set');
  }

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: String(organizationId),
    subscription_data: {
      metadata: { [ORGANIZATION_METADATA_KEY]: String(organizationId) },
    },
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
  });

  if (!session.url) {
    throw new Error('Stripe returned a session without a url');
  }

  return session.url;
}

// Straight after payment: search has not caught up yet, so read the session.
export async function getStatusBySession(
  sessionId: string,
  organizationId: number,
): Promise<SubscriptionStatus | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  if (session.client_reference_id !== String(organizationId)) {
    return null;
  }

  const subscription = session.subscription;
  if (!subscription || typeof subscription === 'string') {
    return null;
  }

  return toStatus(subscription);
}

export async function getStatusByOrganization(
  organizationId: number,
): Promise<SubscriptionStatus | null> {
  const result = await getStripe().subscriptions.search({
    query: `metadata["${ORGANIZATION_METADATA_KEY}"]:"${organizationId}"`,
    limit: 1,
  });

  const subscription = result.data[0];
  return subscription ? toStatus(subscription) : null;
}
