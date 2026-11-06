import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { HttpErrors, RestBindings } from '@loopback/rest';

import {
  requireOrganizationAccess,
  requireStaffRole,
} from './organizationAccess.interceptor';
import { Role } from '../types/roles';

class TestController {
  @requireStaffRole(Role.ADMIN)
  staffOnly(): string {
    return 'ok';
  }

  @requireOrganizationAccess(Role.ADMIN)
  organizationScoped(): string {
    return 'ok';
  }
}

function contextWithUser(
  roles: string[] = [],
  organizationId?: number,
): Context {
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

function contextWithoutUser(): Context {
  const ctx = new Context();
  ctx.bind(RestBindings.Http.REQUEST.key).to({} as never);
  return ctx;
}

function invoke(
  ctx: Context,
  method: keyof TestController,
  args: unknown[] = [],
) {
  return invokeMethodWithInterceptors(ctx, new TestController(), method, args);
}

describe('organization access interceptors', () => {
  it('allows a staff user to update through the unscoped route', async () => {
    await expect(
      invoke(contextWithUser([Role.ADMIN]), 'staffOnly'),
    ).resolves.toBe('ok');
  });

  it('rejects organization users from the unscoped route', async () => {
    await expect(
      invoke(contextWithUser([Role.ORGANIZATION], 10), 'staffOnly'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('allows an organization user to access their own organization', async () => {
    await expect(
      invoke(contextWithUser([Role.ORGANIZATION], 10), 'organizationScoped', [
        10,
      ]),
    ).resolves.toBe('ok');
  });

  it('rejects an organization user accessing another organization', async () => {
    await expect(
      invoke(contextWithUser([Role.ORGANIZATION], 10), 'organizationScoped', [
        11,
      ]),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('rejects users without an accepted role', async () => {
    await expect(
      invoke(contextWithUser([Role.LIST_TREE]), 'staffOnly'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('rejects unauthenticated requests', async () => {
    await expect(invoke(contextWithoutUser(), 'staffOnly')).rejects.toThrow(
      HttpErrors.Unauthorized,
    );
  });
});
