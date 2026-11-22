import { Pool } from 'pg';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { effectiveSpecies } from './speciesChoices';
const org = '11111111-2222-4333-8444-555555555555';
const project = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const request = {} as KeycloakRequest;
describe('Scoped species choices', () => {
  it('does not fall back to all species without a context', async () => {
    const query = jest.fn();
    expect(await effectiveSpecies({ query } as unknown as Pool, [])).toEqual(
      [],
    );
    expect(query).not.toHaveBeenCalled();
  });
  it('refuses a project outside the authorized organization', async () => {
    const query = jest.fn();
    const service = new AdminDomainService({ query } as unknown as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(org);
    jest
      .spyOn(service, 'selectionScope')
      .mockRejectedValue(new Error('Project is outside this organization'));
    await expect(
      service.speciesChoices(request, { projectIds: project }),
    ).rejects.toThrow('outside this organization');
    expect(query).not.toHaveBeenCalled();
  });
  it('carries every distinct project context to the effective allocation query', async () => {
    const query = jest
      .fn()
      .mockResolvedValue({
        rows: [
          {
            id: 'one',
            herbarium_name: 'ACROFRAX',
            scientific_name: 'Acrocarpus fraxinifolius',
          },
        ],
      });
    const service = new AdminDomainService({ query } as unknown as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(org);
    jest
      .spyOn(service, 'selectionScope')
      .mockResolvedValue({ organization: org, project });
    expect(
      (
        await service.speciesChoices(request, {
          projectIds: project + ',none',
          search: 'ACROFRAX',
        })
      ).rows,
    ).toHaveLength(1);
    expect(JSON.parse(query.mock.calls[0][1][0])).toEqual([
      { organization_id: org, project_id: project },
      { organization_id: org, project_id: null },
    ]);
  });
});
