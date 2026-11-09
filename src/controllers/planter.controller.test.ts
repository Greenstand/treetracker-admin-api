import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { RestBindings, HttpErrors } from '@loopback/rest';

import { PlanterController } from './planter.controller';
import { PlanterOrganizationController } from './planterOrganization.controller';
import { Role } from '../types/roles';
import { buildFilterQuery } from '../js/buildFilterQuery.js';

jest.mock('../js/buildFilterQuery.js', () => ({
  buildFilterQuery: jest.fn().mockReturnValue({ sql: '', params: [] }),
}));

const OWN_ORG = 3483;
const OTHER_ORG = 1;

function contextWithUser(roles: string[], organizationId?: number): Context {
  const ctx = new Context();
  ctx.bind(RestBindings.Http.REQUEST.key).to({
    user: {
      id: 'u1',
      policy: {
        policies: roles.map((name) => ({ name })),
        organization:
          organizationId === undefined ? undefined : { id: organizationId },
      },
    },
  } as never);
  return ctx;
}

function planterRepositoryStub() {
  return {
    getEntityIdsByOrganizationId: jest.fn().mockResolvedValue([OWN_ORG]),
    applyOrganizationWhereClause: jest
      .fn()
      .mockImplementation(async (where: object) => where),
    count: jest.fn().mockResolvedValue({ count: 4 }),
    countWithOrg: jest.fn().mockResolvedValue({ count: 9 }),
  };
}

/*
 * Grower records hold names, emails and phone numbers, so the unscoped
 * routes are for Greenstand staff only and the organization routes stay
 * inside the caller's organization (issue #682).
 */
describe('PlanterController GET /planter/count', () => {
  it('lets a greenstand admin count all growers', async () => {
    const planterRepository = planterRepositoryStub();
    const controller = new PlanterController(
      planterRepository as never,
      {} as never,
    );

    await expect(
      invokeMethodWithInterceptors(
        contextWithUser([Role.ADMIN]),
        controller,
        'count',
        [undefined],
      ),
    ).resolves.toEqual({ count: 9 });
  });

  it('rejects an organizational user with 403', async () => {
    const planterRepository = planterRepositoryStub();
    const controller = new PlanterController(
      planterRepository as never,
      {} as never,
    );

    await expect(
      invokeMethodWithInterceptors(
        contextWithUser([Role.ORGANIZATION], OWN_ORG),
        controller,
        'count',
        [undefined],
      ),
    ).rejects.toThrow(HttpErrors.Forbidden);

    expect(planterRepository.countWithOrg).not.toHaveBeenCalled();
  });
});

describe('PlanterOrganizationController GET /organization/{organizationId}/planter/count', () => {
  function organizationController() {
    const planterRepository = planterRepositoryStub();
    return {
      controller: new PlanterOrganizationController(
        planterRepository as never,
        {} as never,
        {} as never,
      ),
      planterRepository,
    };
  }

  it("rejects a read of another organization's growers with 403", async () => {
    const { controller, planterRepository } = organizationController();

    await expect(
      invokeMethodWithInterceptors(
        contextWithUser([Role.ORGANIZATION], OWN_ORG),
        controller,
        'count',
        [OTHER_ORG, undefined],
      ),
    ).rejects.toThrow(HttpErrors.Forbidden);

    expect(planterRepository.count).not.toHaveBeenCalled();
  });

  it('applies the organization filter when the request has no where', async () => {
    const { controller, planterRepository } = organizationController();

    await invokeMethodWithInterceptors(
      contextWithUser([Role.ORGANIZATION], OWN_ORG),
      controller,
      'count',
      [OWN_ORG, undefined],
    );

    expect(planterRepository.applyOrganizationWhereClause).toHaveBeenCalledWith(
      {},
      OWN_ORG,
    );
  });
});

describe('PlanterOrganizationController organization grower routes', () => {
  it("limits planter registrations to the organization's growers", async () => {
    const controller = new PlanterOrganizationController(
      {
        ...planterRepositoryStub(),
        getPlanterIdsByOrganizationId: jest.fn().mockResolvedValue([7]),
      } as never,
      {} as never,
      { execute: jest.fn().mockResolvedValue([]) } as never,
    );

    await invokeMethodWithInterceptors(
      contextWithUser([Role.ORGANIZATION], OWN_ORG),
      controller,
      'findPlanterRegistration',
      [OWN_ORG, { where: { planterId: 7 } }],
    );

    expect(jest.mocked(buildFilterQuery).mock.calls[0][1].filter).toEqual({
      where: { and: [{ planterId: 7 }, { planterId: { inq: [7] } }] },
    });
  });

  it('refuses selfies of a grower from another organization', async () => {
    const treesRepository = {
      getEntityIdsByOrganizationId: jest.fn().mockResolvedValue([OWN_ORG]),
      find: jest.fn(),
    };
    const controller = new PlanterOrganizationController(
      {
        ...planterRepositoryStub(),
        findById: jest.fn().mockResolvedValue({ organizationId: OTHER_ORG }),
      } as never,
      treesRepository as never,
      {} as never,
    );

    await expect(
      invokeMethodWithInterceptors(
        contextWithUser([Role.ORGANIZATION], OWN_ORG),
        controller,
        'findSelfiesById',
        [OWN_ORG, 5, undefined],
      ),
    ).rejects.toThrow(HttpErrors.Unauthorized);

    expect(treesRepository.find).not.toHaveBeenCalled();
  });

  it('keeps the selfies filter on the grower when the request sends its own where', async () => {
    const treesRepository = {
      getEntityIdsByOrganizationId: jest.fn().mockResolvedValue([OWN_ORG]),
      find: jest.fn().mockResolvedValue([]),
    };
    const controller = new PlanterOrganizationController(
      {
        ...planterRepositoryStub(),
        findById: jest.fn().mockResolvedValue({ organizationId: OWN_ORG }),
      } as never,
      treesRepository as never,
      {} as never,
    );

    await invokeMethodWithInterceptors(
      contextWithUser([Role.ORGANIZATION], OWN_ORG),
      controller,
      'findSelfiesById',
      [OWN_ORG, 5, { where: {} }],
    );

    expect(treesRepository.find).toHaveBeenCalledWith({
      where: { planterId: 5, planterPhotoUrl: { neq: null } },
    });
  });
});
