import { Pool } from 'pg';
import { changeProjectGrower, projectGrowers } from './projectGrowers';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const org = '11111111-2222-4333-8444-555555555555';
const project = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const grower = 'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const request = {
  user: { id: grower, policy: { policies: [{ name: 'org' }] } },
} as KeycloakRequest;
it('denies verification-only members assignment writes before opening a transaction', async () => {
  const query = jest
    .fn()
    .mockResolvedValue({
      rows: [{ id: project, organization_id: org, status: 'active' }],
      rowCount: 1,
    });
  const connect = jest.fn();
  const service = new AdminDomainService(({
    query,
    connect,
  } as unknown) as Pool);
  jest.spyOn(service, 'organization').mockResolvedValue(org);
  jest.spyOn(service, 'permissions').mockResolvedValue(['verify_captures']);
  await expect(
    changeProjectGrower(service, request, project, grower, {}),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(connect).not.toHaveBeenCalled();
});
it('does not expose a project from another organization', async () => {
  const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  jest.spyOn(service, 'organization').mockResolvedValue(org);
  await expect(
    projectGrowers(service, request, project, {}),
  ).rejects.toMatchObject({ statusCode: 404 });
  expect(query.mock.calls[0][1]).toEqual([project, org]);
  expect(query).toHaveBeenCalledTimes(1);
});
