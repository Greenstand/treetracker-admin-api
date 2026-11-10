import { HttpErrors } from '@loopback/rest';

import { SubscriptionController } from './subscription.controller';
import {
  createCheckoutSession,
  getStatusByOrganization,
  getStatusBySession,
  isStripeConfigured,
} from '../services/stripeService';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';

jest.mock('../services/stripeService', () => ({
  createCheckoutSession: jest.fn(),
  getStatusByOrganization: jest.fn(),
  getStatusBySession: jest.fn(),
  isStripeConfigured: jest.fn(),
}));

const createCheckoutSessionMock = createCheckoutSession as jest.MockedFunction<
  typeof createCheckoutSession
>;
const getStatusByOrganizationMock =
  getStatusByOrganization as jest.MockedFunction<
    typeof getStatusByOrganization
  >;
const getStatusBySessionMock = getStatusBySession as jest.MockedFunction<
  typeof getStatusBySession
>;
const isStripeConfiguredMock = isStripeConfigured as jest.MockedFunction<
  typeof isStripeConfigured
>;

function controllerFor(organizationId?: number) {
  const request = {
    user: {
      id: 'user-1',
      userName: 'org-user',
      email: 'org@example.org',
      policy: {
        policies: [{ name: 'org' }],
        organization:
          organizationId === undefined ? undefined : { id: organizationId },
      },
    },
  } as unknown as KeycloakRequest;

  return new SubscriptionController(request);
}

describe('SubscriptionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isStripeConfiguredMock.mockReturnValue(true);
  });

  it('creates a session for the caller own organization', async () => {
    createCheckoutSessionMock.mockResolvedValue(
      'https://checkout.stripe.test/s',
    );

    const result = await controllerFor(42).createSession(
      42,
      'https://panel.test/subscription',
    );

    expect(result).toEqual({ url: 'https://checkout.stripe.test/s' });
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      42,
      'https://panel.test/subscription',
    );
  });

  it('refuses another organization', async () => {
    await expect(
      controllerFor(42).createSession(7, 'https://panel.test/subscription'),
    ).rejects.toThrow(HttpErrors.Forbidden);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it('refuses a caller with no organization', async () => {
    await expect(
      controllerFor().createSession(42, 'https://panel.test/subscription'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('reads the session straight after payment', async () => {
    getStatusBySessionMock.mockResolvedValue({
      status: 'active',
      currentPeriodEnd: '2026-11-14T00:00:00.000Z',
    });

    const result = await controllerFor(42).find(42, 'cs_test_1');

    expect(result.status).toBe('active');
    expect(getStatusBySessionMock).toHaveBeenCalledWith('cs_test_1', 42);
    expect(getStatusByOrganizationMock).not.toHaveBeenCalled();
  });

  it('searches by organization when there is no session', async () => {
    getStatusByOrganizationMock.mockResolvedValue({
      status: 'active',
      currentPeriodEnd: null,
    });

    await controllerFor(42).find(42);

    expect(getStatusByOrganizationMock).toHaveBeenCalledWith(42);
    expect(getStatusBySessionMock).not.toHaveBeenCalled();
  });

  it('reports none when the organization has no subscription', async () => {
    getStatusByOrganizationMock.mockResolvedValue(null);

    expect(await controllerFor(42).find(42)).toEqual({
      status: 'none',
      currentPeriodEnd: null,
    });
  });

  it('fails clearly when stripe is not configured', async () => {
    isStripeConfiguredMock.mockReturnValue(false);

    await expect(controllerFor(42).find(42)).rejects.toThrow(
      HttpErrors.ServiceUnavailable,
    );
  });
});
