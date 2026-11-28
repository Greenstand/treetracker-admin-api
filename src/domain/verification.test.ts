import { verificationInput } from './verification';
import { transferGrower } from './growerTransfer';
import { AdminDomainService } from './service';
import { Pool } from 'pg';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
const id = '11111111-2222-4333-8444-555555555555';
const base = {
  requestId: id,
  captures: [{ id, updated_at: '2026-11-22T00:00:00Z' }],
  decision: 'approved',
  morphology: 'seedling',
  age: 0,
};
describe('NDM verification input', () => {
  it('requires a rejection reason and at least one versioned capture', () => {
    expect(() => verificationInput({ ...base, decision: 'rejected' })).toThrow(
      'Rejection reason',
    );
    expect(() => verificationInput({ ...base, captures: [] })).toThrow(
      'Select between',
    );
    expect(() => verificationInput({ ...base, captures: [{ id }] })).toThrow(
      'Capture version',
    );
  });
  it('rejects duplicate captures and invalid classification values', () => {
    expect(() =>
      verificationInput({
        ...base,
        captures: [...base.captures, ...base.captures],
      }),
    ).toThrow('Duplicate');
    expect(() => verificationInput({ ...base, age: 99 })).toThrow(
      'Choose new tree',
    );
    expect(() =>
      verificationInput({ ...base, species_id: 'not-uuid' }),
    ).toThrow('UUID');
  });
  it('normalizes tags without accepting arbitrary payload objects', () => {
    expect(
      verificationInput({
        ...base,
        tags: [' Mango ', 'Mango', 'mango', 'Mango'],
      }).annotations.tags,
    ).toEqual(['Mango']);
    expect(() => verificationInput({ ...base, tags: [{}] })).toThrow(
      'Invalid Tag',
    );
  });
});
it('denies organization callers grower transfers before any database access', async () => {
  const query = jest.fn();
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  await expect(
    transferGrower(
      service,
      {
        user: { id, policy: { policies: [{ name: 'org' }] } },
      } as KeycloakRequest,
      id,
      {},
    ),
  ).rejects.toMatchObject({ statusCode: 403 });
  expect(query).not.toHaveBeenCalled();
});
