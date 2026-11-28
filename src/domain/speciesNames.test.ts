import { Pool } from 'pg';
import { speciesNames } from './validation';
import { AdminDomainService } from './service';

describe('Separate herbarium and Latin names', () => {
  it('normalizes the code without changing Latin spelling', () => {
    expect(
      speciesNames(
        {
          herbarium_name: 'acrofrax',
          scientific_name: 'Acrocarpus fraxinifolius Arn.',
        },
        true,
      ),
    ).toEqual({
      herbarium_name: 'ACROFRAX',
      scientific_name: 'Acrocarpus fraxinifolius Arn.',
    });
  });
  it('supports an unknown Latin name and rejects an unidentified new record', () => {
    expect(
      speciesNames({ herbarium_name: 'ACROFRAX' }, true).scientific_name,
    ).toBeNull();
    expect(() => speciesNames({}, true)).toThrow(
      'Enter a herbarium name or Latin name',
    );
  });
  it.each(['ABC', 'ACRO1234', 'ACROFRAXX'])(
    'rejects invalid code %s',
    (herbarium_name) => {
      expect(() => speciesNames({ herbarium_name }, true)).toThrow();
    },
  );
  it('preserves a code omitted by an older edit form', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 1, rows: [{}] });
    const service = new AdminDomainService({ query } as unknown as Pool);
    await service.saveSpecies('11111111-2222-4333-8444-555555555555', {
      scientific_name: 'Acrocarpus fraxinifolius',
      updated_at: '2026-11-22T00:00:00.000Z',
    });
    expect(query.mock.calls[0][0]).toContain(
      'herbarium_name=CASE WHEN $8::boolean',
    );
    expect(query.mock.calls[0][1][7]).toBe(false);
  });
});
