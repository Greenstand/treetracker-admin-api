import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { RestBindings, HttpErrors } from '@loopback/rest';

import { requireRole } from './requireRole.interceptor';
import { Role } from '../types/roles';

class TestController {
  @requireRole(Role.ADMIN)
  adminOnly(): string {
    return 'ok';
  }

  @requireRole(Role.ADMIN, Role.SUPER_PERMISSION)
  adminOrSuper(): string {
    return 'ok';
  }
}

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

function invoke(ctx: Context, method: keyof TestController) {
  return invokeMethodWithInterceptors(ctx, new TestController(), method, []);
}

describe('requireRole interceptor', () => {
  it('invokes the method when the user has the required role', async () => {
    await expect(
      invoke(contextWithRoles([Role.ADMIN]), 'adminOnly'),
    ).resolves.toBe('ok');
  });

  it('throws 403 Forbidden when the user lacks the required role', async () => {
    await expect(
      invoke(contextWithRoles(['list_tree']), 'adminOnly'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('throws 401 Unauthorized when there is no authenticated user', async () => {
    await expect(
      invoke(contextWithRoles(undefined), 'adminOnly'),
    ).rejects.toThrow(HttpErrors.Unauthorized);
  });

  it('allows access when the user has any one of several accepted roles', async () => {
    await expect(
      invoke(contextWithRoles([Role.SUPER_PERMISSION]), 'adminOrSuper'),
    ).resolves.toBe('ok');
  });
});
