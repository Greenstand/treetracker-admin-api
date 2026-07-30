import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { RestBindings, HttpErrors } from '@loopback/rest';

import { TreesController } from './trees.controller';
import { Trees } from '../models';
import { Role } from '../types/roles';

jest.mock('../messaging/RabbitMQMessaging.js', () => ({
  publishMessage: jest.fn(),
}));

jest.mock('../config.js', () => ({
  config: { enableVerificationPublishing: false },
}));

const APPROVED_CAPTURE = {
  id: 3,
  approved: true,
  active: true,
  morphology: 'seedling',
  age: 'new_tree',
  captureApprovalTag: 'simple_leaf',
} as Trees;

function transactionStub() {
  return {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };
}

function controllerWith(transaction: ReturnType<typeof transactionStub>) {
  const treesRepository = {
    dataSource: {
      beginTransaction: jest.fn().mockResolvedValue(transaction),
    },
    updateById: jest.fn().mockResolvedValue(undefined),
  };
  const domainEventRepository = { create: jest.fn() };

  return {
    controller: new TreesController(
      treesRepository as never,
      domainEventRepository as never,
    ),
    treesRepository,
  };
}

/*
 * The interceptor reads the authenticated user off the request, so the role
 * under test is expressed as the policies the Keycloak middleware would have
 * attached. `undefined` stands in for an unauthenticated request.
 */
function contextWithRoles(roles: string[] | undefined): Context {
  const ctx = new Context();
  const user =
    roles === undefined
      ? undefined
      : {
          id: 'u1',
          policy: { policies: roles.map((name) => ({ name })) },
        };
  ctx.bind(RestBindings.Http.REQUEST.key).to({ user } as never);
  return ctx;
}

describe('TreesController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
   * PATCH /trees/{id} is the unscoped verify route. The admin client only
   * builds this URL when the caller has no organization_id claim, so a
   * greenstand admin is the only legitimate caller — organizational users are
   * routed to PATCH /organization/{organizationId}/trees/{id} instead.
   */
  describe('PATCH /trees/{id}', () => {
    it('lets a greenstand admin verify a capture', async () => {
      const transaction = transactionStub();
      const { controller, treesRepository } = controllerWith(transaction);

      await invokeMethodWithInterceptors(
        contextWithRoles([Role.ADMIN]),
        controller,
        'updateById',
        [3, APPROVED_CAPTURE],
      );

      expect(treesRepository.updateById).toHaveBeenCalledWith(
        3,
        APPROVED_CAPTURE,
        { transaction },
      );
      expect(transaction.commit).toHaveBeenCalledTimes(1);
      expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it('rejects an organizational user with 403 and leaves the capture untouched', async () => {
      const transaction = transactionStub();
      const { controller, treesRepository } = controllerWith(transaction);

      await expect(
        invokeMethodWithInterceptors(
          contextWithRoles([Role.ORGANIZATION]),
          controller,
          'updateById',
          [3, APPROVED_CAPTURE],
        ),
      ).rejects.toThrow(HttpErrors.Forbidden);

      expect(treesRepository.updateById).not.toHaveBeenCalled();
      expect(transaction.commit).not.toHaveBeenCalled();
    });

    it('rejects a user holding an unrelated role with 403', async () => {
      const transaction = transactionStub();
      const { controller, treesRepository } = controllerWith(transaction);

      await expect(
        invokeMethodWithInterceptors(
          contextWithRoles(['list_tree']),
          controller,
          'updateById',
          [3, APPROVED_CAPTURE],
        ),
      ).rejects.toThrow(HttpErrors.Forbidden);

      expect(treesRepository.updateById).not.toHaveBeenCalled();
    });

    it('rejects an unauthenticated request with 401', async () => {
      const transaction = transactionStub();
      const { controller, treesRepository } = controllerWith(transaction);

      await expect(
        invokeMethodWithInterceptors(
          contextWithRoles(undefined),
          controller,
          'updateById',
          [3, APPROVED_CAPTURE],
        ),
      ).rejects.toThrow(HttpErrors.Unauthorized);

      expect(treesRepository.updateById).not.toHaveBeenCalled();
    });
  });
});
