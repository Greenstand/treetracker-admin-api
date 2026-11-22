import { Pool } from 'pg';
import { subscriptionUsage } from './subscriptionUsage';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const org = '11111111-2222-4333-8444-555555555555';
const request = {
  user: { id: org, policy: { policies: [{ name: 'greenstand-admin' }] } },
} as KeycloakRequest;
it('requires an organization before counting usage, including for platform admins', async () => {
  const query = jest.fn();
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  await expect(subscriptionUsage(service, request, {})).rejects.toMatchObject({
    statusCode: 400,
  });
  expect(query).not.toHaveBeenCalled();
});
it('does not count outside approved organization membership', async () => {
  const query = jest.fn();
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  jest
    .spyOn(service, 'organization')
    .mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 }),
    );
  await expect(
    subscriptionUsage(service, request, { organizationId: org }),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(query).not.toHaveBeenCalled();
});
it('returns numeric organization counts without depending on Stripe availability', async () => {
  const asOf = new Date('2026-11-22T00:00:00Z');
  const query = jest
    .fn()
    .mockResolvedValue({
      rows: [{ projects: '2', captures: '6000', growers: '11', as_of: asOf }],
    });
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  jest.spyOn(service, 'organization').mockResolvedValue(org);
  await expect(
    subscriptionUsage(service, request, { organizationId: org }),
  ).resolves.toEqual({
    organizationId: org,
    projects: 2,
    captures: 6000,
    growers: 11,
    asOf,
  });
  expect(query.mock.calls[0][1]).toEqual([org]);
});
