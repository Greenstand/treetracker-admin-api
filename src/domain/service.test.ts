import { Pool } from 'pg';
import { AdminDomainService } from './service';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { DomainError, projectValues } from './validation';
const own = '11111111-2222-4333-8444-555555555555';
const other = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const orgUser = {
  user: {
    id: 'user',
    policy: { policies: [{ name: 'org' }], organization: { id: 3414 } },
  },
} as KeycloakRequest;
describe('Domain organization boundaries', () => {
  const query = jest.fn();
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  beforeEach(() => {
    query.mockReset();
  });
  it('resolves a numeric claim to exactly one active Stakeholder UUID', async () => {
    query.mockResolvedValue({ rows: [{ id: own }], rowCount: 1 });
    expect(await service.organization(orgUser)).toBe(own);
    expect(query.mock.calls[0][0]).toContain('stakeholder.stakeholder');
    expect(query.mock.calls[0][1]).toEqual([3414]);
  });
  it('rejects a caller-selected organization outside membership', async () => {
    query.mockResolvedValue({ rows: [{ id: own }], rowCount: 1 });
    await expect(service.organization(orgUser, other)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(query).toHaveBeenCalledTimes(1);
  });
  it('rejects ambiguous membership instead of choosing the first organization', async () => {
    query.mockResolvedValue({
      rows: [{ id: own }, { id: other }],
      rowCount: 2,
    });
    await expect(service.organization(orgUser)).rejects.toBeInstanceOf(
      DomainError,
    );
  });
  it('requires an approved organization claim even if a UUID is supplied', async () => {
    const unbound = {
      user: { id: 'user', policy: { policies: [{ name: 'org' }] } },
    } as KeycloakRequest;
    await expect(service.organization(unbound, own)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(query).not.toHaveBeenCalled();
  });
  it('requires a selection for a platform administrator performing a scoped write', async () => {
    const admin = {
      user: {
        id: 'admin',
        policy: { policies: [{ name: 'greenstand-admin' }] },
      },
    } as KeycloakRequest;
    await expect(
      service.organization(admin, undefined, true),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
describe('Organization permission defaults', () => {
  const query = jest.fn();
  const service = new AdminDomainService(({ query } as unknown) as Pool);
  beforeEach(() => query.mockResolvedValue({ rows: [], rowCount: 0 }));
  it('defaults ordinary members to verification and denies project writes', async () => {
    expect(await service.permissions(orgUser, own)).toEqual([
      'verify_captures',
    ]);
    await expect(
      service.requirePermission(orgUser, own, 'manage_projects'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
  it('uses explicit scoped grants', async () => {
    query.mockResolvedValue({
      rows: [{ permissions: ['verify_captures', 'manage_projects'] }],
      rowCount: 1,
    });
    await expect(
      service.requirePermission(orgUser, own, 'manage_projects'),
    ).resolves.toBeUndefined();
    expect(query.mock.calls[0][1]).toEqual([own, 'user']);
  });
});
describe('Project edit validation', () => {
  it('rejects impossible dates, negative targets and active script image URLs', () => {
    for (const extra of [
      { starts_on: '2026-02-30' },
      { target_trees: -1 },
      { logo_url: 'javascript:alert(1)' },
    ]) {
      expect(() =>
        projectValues({ name: 'Project', code: 'P', ...extra }),
      ).toThrow(DomainError);
    }
  });
  it('preserves separate tree and capture targets', () => {
    const values = projectValues({
      name: 'Project',
      code: 'P',
      target_trees: 20,
      target_captures: 70,
    });
    expect(values[8]).toBe(20);
    expect(values[9]).toBe(70);
  });
  it('requires a version field when updating old nullable versions', () => {
    const service = new AdminDomainService({} as Pool);
    expect(() => service.version({})).toThrow(DomainError);
    expect(service.version({ updated_at: null })).toBeNull();
  });
});

describe('Species inheritance after catalog hiding', () => {
  it('keeps an explicitly configured project scope when its selected species become hidden', async () => {
    const query = jest.fn().mockResolvedValue({
      rows: [
        {
          project_id: other,
          species_id: own,
          scientific_name: 'Fixture',
          is_hidden: true,
        },
      ],
    });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest
      .spyOn(service, 'selectionScope')
      .mockResolvedValue({ organization: own, project: other });
    expect(await service.speciesSelection(orgUser, {})).toEqual({
      source: 'Project',
      rows: [],
      localNames: expect.any(Array),
    });
    expect(query).toHaveBeenCalledTimes(3);
  });
});

describe('New project species defaults', () => {
  it('atomically creates an empty project scope rather than inheriting every species', async () => {
    const query = jest
      .fn()
      .mockResolvedValue({ rowCount: 1, rows: [{ id: other }] });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    jest.spyOn(service, 'requirePermission').mockResolvedValue(undefined);
    await service.saveProject(orgUser, undefined, {
      name: 'New project',
      code: 'NEW',
    });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('INSERT INTO stakeholder.project');
    expect(query.mock.calls[0][0]).toContain(
      'INSERT INTO herbarium.species_selection_scope',
    );
    expect(query.mock.calls[0][0]).toContain(
      'SELECT organization_id,id FROM new_project',
    );
  });
  it('preserves the existing species scope when editing a project', async () => {
    const query = jest
      .fn()
      .mockResolvedValue({ rowCount: 1, rows: [{ id: other }] });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    jest.spyOn(service, 'requirePermission').mockResolvedValue(undefined);
    await service.saveProject(orgUser, other, {
      name: 'Existing',
      code: 'OLD',
      updated_at: null,
    });
    expect(query.mock.calls[0][0]).not.toContain('species_selection_scope');
  });
});

describe('Session map organization boundaries', () => {
  it('does not read geometry for a session outside the authorized organization', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    await expect(service.sessionMap(orgUser, other)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([other, own]);
  });
  it('returns an envelope without transferring the individual capture records', async () => {
    const geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [1, 1],
          [2, 1],
          [2, 2],
          [1, 1],
        ],
      ],
    };
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ organization_id: own }] })
      .mockResolvedValueOnce({ rows: [{ source: 'captures', geometry }] });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    expect(await service.sessionMap(orgUser, other)).toEqual({
      source: 'captures',
      geometry,
      approximate: true,
    });
    expect(query.mock.calls[1][1]).toEqual([other, own]);
    expect(query.mock.calls[1][0]).toContain('field_data.session_segment');
    expect(query.mock.calls[1][0]).toContain('ST_ConvexHull');
  });
});

describe('Grower account organization boundaries', () => {
  it('does not load project or device details for an inaccessible grower', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    await expect(service.growerAccount(orgUser, other)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([other, own]);
  });
  it('uses NDM assignments and session activity with scope applied to projects', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: other, first_name: 'Fixture' }],
      })
      .mockResolvedValueOnce({ rows: [{ id: own, association: 'Assigned' }] })
      .mockResolvedValueOnce({ rows: [{ app_version: 'fixture' }] });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    const r = await service.growerAccount(orgUser, other);
    expect(r.projects).toHaveLength(1);
    expect(query.mock.calls[1][0]).toContain('stakeholder.project_grower');
    expect(query.mock.calls[1][1]).toEqual([other, own]);
    expect(query.mock.calls[2][0]).toContain('field_data.device_configuration');
  });
});

describe('Exact session lookup for verification', () => {
  it('keeps organization scope and validates a session UUID', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const service = new AdminDomainService(({ query } as unknown) as Pool);
    jest.spyOn(service, 'organization').mockResolvedValue(own);
    await service.sessions(orgUser, { sessionId: other });
    expect(query.mock.calls[0][1][0]).toBe(own);
    expect(query.mock.calls[0][1][5]).toBe(other);
    query.mockClear();
    await expect(
      service.sessions(orgUser, { sessionId: 'invalid' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(query).not.toHaveBeenCalled();
  });
});
