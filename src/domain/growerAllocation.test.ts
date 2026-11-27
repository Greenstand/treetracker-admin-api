import { Pool, PoolClient } from 'pg';
import {
  allocateUnassigned,
  allocationPreview,
  allocationSnapshot,
  allocationVersion,
} from './growerAllocation';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const id = '11111111-2222-4333-8444-555555555555';
const snapshot = {
  sessions: [{ id, organization_id: null, project_id: null }],
  captures: [{ id, planting_organization_id: null }],
  rawCount: 1,
};
function db() {
  const query = jest.fn(async (sql: string) => {
    if (sql.includes('SELECT s.id')) return { rows: snapshot.sessions };
    if (sql.includes('SELECT c.id')) return { rows: snapshot.captures };
    if (sql.includes('count(*)')) return { rows: [{ count: 1 }] };
    return { rows: [], rowCount: 1 };
  });
  return { query };
}
it('refuses a stale preview before any ownership write', async () => {
  const c = db();
  await expect(
    allocateUnassigned(c as unknown as PoolClient, id, id, null, 'stale'),
  ).rejects.toMatchObject({ statusCode: 409 });
  expect(c.query.mock.calls.some(([sql]) => sql.startsWith('UPDATE'))).toBe(
    false,
  );
});
it('updates only the exact ownerless IDs locked by the preview', async () => {
  const c = db();
  const result = await allocateUnassigned(
    c as unknown as PoolClient,
    id,
    id,
    null,
    allocationVersion(snapshot, id, null),
  );
  expect(result.sessions).toEqual(snapshot.sessions);
  expect(
    c.query.mock.calls.some(([sql]) => sql.includes('FOR UPDATE OF s')),
  ).toBe(true);
  expect(
    c.query.mock.calls.some(
      ([sql]) =>
        sql.includes('planting_organization_id IS NOT NULL') &&
        sql.includes('tree_id IS NOT NULL'),
    ),
  ).toBe(true);
  expect(c.query).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE treetracker.capture'),
    [[id], id],
  );
  expect(c.query).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE field_data.session'),
    [[id], id, null],
  );
});
it('requires a platform role even for the first allocation preview', async () => {
  const c = db();
  const service = new AdminDomainService(c as unknown as Pool);
  await expect(
    allocationPreview(
      service,
      {
        user: { policy: { policies: [{ name: 'org-admin-saas' }] } },
      } as KeycloakRequest,
      id,
      { organizationId: id },
    ),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(c.query).not.toHaveBeenCalled();
});
it('preview tokens bind the destination, project and exact observed rows', async () => {
  const c = db();
  const result = await allocationSnapshot(c as unknown as Pool, id);
  expect(allocationVersion(result, id, null)).toBe(
    allocationVersion(snapshot, id, null),
  );
  expect(allocationVersion(result, id, id)).not.toBe(
    allocationVersion(result, id, null),
  );
});
