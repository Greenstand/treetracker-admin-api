import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { RestBindings, HttpErrors } from '@loopback/rest';

import { TreesOrganizationController } from './treesOrganization.controller';
import { Role } from '../types/roles';

const OWN_ORG = 3483;
const SUB_ORG = 3484;
const OTHER_ORG = 1;
const ORG_CLAUSE = { plantingOrganizationId: { inq: [OWN_ORG, SUB_ORG] } };

function organizationUserContext(organizationId: number): Context {
  const ctx = new Context();
  ctx.bind(RestBindings.Http.REQUEST.key).to({
    user: {
      id: 'u1',
      policy: {
        policies: [{ name: Role.ORGANIZATION }],
        organization: { id: organizationId },
      },
    },
  } as never);
  return ctx;
}

function controllerWithRepository() {
  const treesRepository = {
    getEntityIdsByOrganizationId: jest
      .fn()
      .mockResolvedValue([OWN_ORG, SUB_ORG]),
    applyOrganizationWhereClause: jest
      .fn()
      .mockImplementation(async (where: object) => ({
        and: [where, ORG_CLAUSE],
      })),
    countWithTagId: jest.fn().mockResolvedValue({ count: 2 }),
  };
  return {
    controller: new TreesOrganizationController(treesRepository as never),
    treesRepository,
  };
}

/*
 * The organization routes are how organizational users read captures, so
 * each request must stay inside the caller's own organization tree
 * (issue #682).
 */
describe('TreesOrganizationController GET /organization/{organizationId}/trees/count', () => {
  it("rejects a read of another organization's captures with 403", async () => {
    const { controller, treesRepository } = controllerWithRepository();

    await expect(
      invokeMethodWithInterceptors(
        organizationUserContext(OWN_ORG),
        controller,
        'count',
        [OTHER_ORG, undefined],
      ),
    ).rejects.toThrow(HttpErrors.Forbidden);

    expect(treesRepository.countWithTagId).not.toHaveBeenCalled();
  });

  it('applies the organization filter when the request has no where', async () => {
    const { controller, treesRepository } = controllerWithRepository();

    await invokeMethodWithInterceptors(
      organizationUserContext(OWN_ORG),
      controller,
      'count',
      [OWN_ORG, undefined],
    );

    expect(treesRepository.applyOrganizationWhereClause).toHaveBeenCalledWith(
      {},
      OWN_ORG,
    );
    expect(treesRepository.countWithTagId).toHaveBeenCalledWith(
      { and: [{}, ORG_CLAUSE] },
      undefined,
    );
  });

  it('ignores a where.organizationId outside the organization tree', async () => {
    const { controller, treesRepository } = controllerWithRepository();

    await invokeMethodWithInterceptors(
      organizationUserContext(OWN_ORG),
      controller,
      'count',
      [OWN_ORG, { organizationId: OTHER_ORG }],
    );

    expect(treesRepository.applyOrganizationWhereClause).toHaveBeenCalledWith(
      {},
      OWN_ORG,
    );
  });

  it('narrows to a sub-organization named in where.organizationId', async () => {
    const { controller, treesRepository } = controllerWithRepository();

    await invokeMethodWithInterceptors(
      organizationUserContext(OWN_ORG),
      controller,
      'count',
      [OWN_ORG, { organizationId: SUB_ORG }],
    );

    expect(treesRepository.applyOrganizationWhereClause).toHaveBeenCalledWith(
      {},
      SUB_ORG,
    );
  });
});
