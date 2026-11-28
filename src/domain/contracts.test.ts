import { Pool } from 'pg';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import {
  saveAgreement,
  contractTransition,
  saveContract,
  workerVerification,
} from './contracts';
const id = '11111111-2222-4333-8444-555555555555';
const admin = {
  user: { id, policy: { policies: [{ name: 'greenstand-admin' }] } },
} as KeycloakRequest;
it.each([
  ['unsigned', 'signed'],
  ['unsigned', 'aborted'],
  ['signed', 'completed'],
  ['signed', 'cancelled'],
])('permits beta transition %s to %s', (from, to) =>
  expect(() => contractTransition(from, to)).not.toThrow(),
);
it.each([
  ['unsigned', 'completed'],
  ['signed', 'unsigned'],
  ['completed', 'signed'],
  ['cancelled', 'signed'],
  ['aborted', 'unsigned'],
])('refuses transition %s to %s', (from, to) =>
  expect(() => contractTransition(from, to)).toThrow(),
);
it('rejects verifier-only staff before any contract or verification DB access', async () => {
  const query = jest.fn(),
    connect = jest.fn(),
    s = new AdminDomainService({ query, connect } as unknown as Pool);
  const staff = {
    user: { id, policy: { policies: [{ name: 'org' }] } },
  } as KeycloakRequest;
  await expect(saveContract(s, staff, undefined, {})).rejects.toMatchObject({
    statusCode: 403,
  });
  await expect(workerVerification(s, staff, id, {})).rejects.toMatchObject({
    statusCode: 403,
  });
  expect(query).not.toHaveBeenCalled();
  expect(connect).not.toHaveBeenCalled();
});
it('rejects a project outside the authorized organization and rolls back creation', async () => {
  const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release = jest.fn(),
    s = new AdminDomainService({
      connect: jest.fn().mockResolvedValue({ query, release }),
    } as unknown as Pool);
  jest.spyOn(s, 'organization').mockResolvedValue(id);
  await expect(
    saveContract(s, admin, undefined, {
      project_id: id,
      grower_account_id: id,
      agreement_id: id,
      capture_quota: 10,
      reason: 'Test',
    }),
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(query.mock.calls.some(([sql]) => sql.includes('INSERT'))).toBe(false);
  expect(query).toHaveBeenLastCalledWith('ROLLBACK');
  expect(release).toHaveBeenCalled();
});
it('rejects future-dated verification before connecting', async () => {
  const connect = jest.fn(),
    s = new AdminDomainService({ connect } as unknown as Pool);
  await expect(
    workerVerification(s, admin, id, {
      outcome: 'approved',
      verified_at: '2999-01-01T00:00:00Z',
    }),
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(connect).not.toHaveBeenCalled();
});

it('denies agreement creation to verification-only staff', async () => {
  const connect = jest.fn(),
    s = new AdminDomainService({ connect } as unknown as Pool);
  const staff = {
    user: { id, policy: { policies: [{ name: 'org' }] } },
  } as KeycloakRequest;
  await expect(saveAgreement(s, staff, undefined, {})).rejects.toMatchObject({
    statusCode: 403,
  });
  expect(connect).not.toHaveBeenCalled();
});
it('rolls back agreement creation when its earnings rule is unauthorized', async () => {
  const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release = jest.fn(),
    s = new AdminDomainService({
      connect: jest.fn().mockResolvedValue({ query, release }),
    } as unknown as Pool);
  jest.spyOn(s, 'organization').mockResolvedValue(id);
  await expect(
    saveAgreement(s, admin, undefined, {
      name: 'Terms',
      funder_id: id,
      consolidation_rule_id: id,
      max_captures: 100,
      capture_payment: '0.25',
      capture_payment_currency: 'USD',
      reason: 'Test',
    }),
  ).rejects.toThrow('authorized earnings');
  expect(query.mock.calls.some(([sql]) => sql.includes('INSERT'))).toBe(false);
  expect(query).toHaveBeenLastCalledWith('ROLLBACK');
});
it('refuses stale agreement status changes without writing an event', async () => {
  const query = jest
      .fn()
      .mockResolvedValue({ rows: [{ id, status: 'closed' }], rowCount: 1 }),
    release = jest.fn(),
    s = new AdminDomainService({
      connect: jest.fn().mockResolvedValue({ query, release }),
    } as unknown as Pool);
  jest.spyOn(s, 'organization').mockResolvedValue(id);
  await expect(
    saveAgreement(s, admin, id, {
      expected_status: 'planning',
      status: 'open',
      reason: 'Test',
    }),
  ).rejects.toMatchObject({ statusCode: 409 });
  expect(query.mock.calls.some(([sql]) => sql.includes('INSERT'))).toBe(false);
  expect(query).toHaveBeenLastCalledWith('ROLLBACK');
});
