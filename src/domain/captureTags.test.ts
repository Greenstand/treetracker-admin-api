import { Pool } from 'pg';
import { captureTags } from './captureTags';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const org = '11111111-2222-4333-8444-555555555555';
const request = {
  user: { id: org, policy: { policies: [{ name: 'greenstand-admin' }] } },
} as KeycloakRequest;
it('rejects an unscoped dictionary even for platform administrators', async () => {
  const query = jest.fn();
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  await expect(captureTags(service, request, {})).rejects.toMatchObject({
    statusCode: 400,
  });
  expect(query).not.toHaveBeenCalled();
});
it('does not query tags when the organization or project is unauthorized', async () => {
  const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  jest
    .spyOn(service, 'organization')
    .mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 }),
    );
  await expect(
    captureTags(service, request, { organizationId: org }),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(query).not.toHaveBeenCalled();
  jest.spyOn(service, 'organization').mockResolvedValue(org);
  jest.spyOn(service, 'requirePermission').mockResolvedValue();
  await expect(
    captureTags(service, request, { organizationId: org, projectId: org }),
  ).rejects.toMatchObject({ statusCode: 404 });
  expect(query).toHaveBeenCalledTimes(1);
});
