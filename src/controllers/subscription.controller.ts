import { get, post, param, HttpErrors, RestBindings } from '@loopback/rest';
import { inject } from '@loopback/context';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { requireRole } from '../interceptors/requireRole.interceptor';
import { Role } from '../types/roles';
import {
  SubscriptionStatus,
  createCheckoutSession,
  getStatusByOrganization,
  getStatusBySession,
  isStripeConfigured,
} from '../services/stripeService';

const SUBSCRIPTION_RESPONSE = {
  '200': {
    description: 'Subscription status for the organization',
    content: { 'application/json': { schema: { type: 'object' } } },
  },
};

export class SubscriptionController {
  constructor(
    @inject(RestBindings.Http.REQUEST, { optional: true })
    private request?: KeycloakRequest,
  ) {}

  // The caller may only touch their own organization's subscription.
  private assertOwnOrganization(organizationId: number): void {
    if (this.request?.user?.policy?.organization?.id !== organizationId) {
      throw new HttpErrors.Forbidden(
        'You can only manage your own organization',
      );
    }
  }

  private assertConfigured(): void {
    if (!isStripeConfigured()) {
      throw new HttpErrors.ServiceUnavailable('Stripe is not configured');
    }
  }

  @post('/organizations/{id}/subscription/session', {
    responses: {
      '200': {
        description: 'Stripe Checkout url',
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    },
  })
  @requireRole(Role.ORGANIZATION)
  async createSession(
    @param.path.number('id') id: number,
    @param.query.string('returnUrl') returnUrl?: string,
  ): Promise<{ url: string }> {
    this.assertConfigured();
    this.assertOwnOrganization(id);

    const target = returnUrl ?? process.env.STRIPE_RETURN_URL;
    if (!target) {
      throw new HttpErrors.BadRequest('Missing returnUrl');
    }

    return { url: await createCheckoutSession(id, target) };
  }

  @get('/organizations/{id}/subscription', { responses: SUBSCRIPTION_RESPONSE })
  @requireRole(Role.ORGANIZATION)
  async find(
    @param.path.number('id') id: number,
    @param.query.string('session_id') sessionId?: string,
  ): Promise<SubscriptionStatus> {
    this.assertConfigured();
    this.assertOwnOrganization(id);

    const status = sessionId
      ? await getStatusBySession(sessionId, id)
      : await getStatusByOrganization(id);

    return status ?? { status: 'none', currentPeriodEnd: null };
  }
}
