import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { RestBindings, HttpErrors } from '@loopback/rest';

import { PlanterController } from './planter.controller';
import { PlanterOrganizationController } from './planterOrganization.controller';
import { Role } from '../types/roles';

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
