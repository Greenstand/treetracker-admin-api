import { Pool } from 'pg';
import { changeSessionProject, sessionProject } from './sessionProject';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const id = '11111111-2222-4333-8444-555555555555';
const request = {
  user: { id, policy: { policies: [{ name: 'greenstand-admin' }] } },
} as KeycloakRequest;
it('hides sessions outside the resolved organization', async () => {
  const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
  const service = new AdminDomainService({ query } as unknown as Pool);
  jest.spyOn(service, 'organization').mockResolvedValue(id);
  await expect(sessionProject(service, request, id, {})).rejects.toMatchObject({
    statusCode: 404,
  });
  expect(query.mock.calls[0][1]).toEqual([id, id]);
  expect(query).toHaveBeenCalledTimes(1);
});
it('requires the allocation version and a reason before a write transaction', async () => {
  const connect = jest.fn();
  const service = new AdminDomainService({ connect } as unknown as Pool);
  jest.spyOn(service, 'organization').mockResolvedValue(id);
  const base = {
    requestId: id,
    project_id: null,
    expected_project_id: null,
    expected_event_id: null,
  };
  await expect(
    changeSessionProject(service, request, id, base),
  ).rejects.toThrow('Allocation reason');
  await expect(
    changeSessionProject(service, request, id, {
      ...base,
      reason: 'Correction',
      expected_event_id: undefined,
    }),
  ).rejects.toThrow('Allocation version');
  expect(connect).not.toHaveBeenCalled();
});
it('denies verification-only staff and rolls back before changing allocation', async () => {
  const query = jest.fn().mockResolvedValue({
    rows: [{ organization_id: id, project_id: null }],
    rowCount: 1,
  });
  const release = jest.fn();
  const service = new AdminDomainService({
    connect: jest.fn().mockResolvedValue({ query, release }),
  } as unknown as Pool);
  jest.spyOn(service, 'organization').mockResolvedValue(id);
  jest
    .spyOn(service, 'requirePermission')
    .mockRejectedValue(Object.assign(new Error('Denied'), { statusCode: 403 }));
  await expect(
    changeSessionProject(service, request, id, {
      requestId: id,
      project_id: null,
      expected_project_id: null,
      expected_event_id: null,
      reason: 'Correction',
    }),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(query).toHaveBeenCalledWith('ROLLBACK');
  expect(
    query.mock.calls.some((call) => String(call[0]).startsWith('UPDATE')),
  ).toBe(false);
  expect(release).toHaveBeenCalled();
});

it('denies organization project managers before opening a transaction', async () => {
  const connect = jest.fn();
  const service = new AdminDomainService({ connect } as unknown as Pool);
  const member = {
    user: { id, policy: { policies: [{ name: 'org-admin-saas' }] } },
  } as KeycloakRequest;
  await expect(
    changeSessionProject(service, member, id, {}),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(connect).not.toHaveBeenCalled();
});
