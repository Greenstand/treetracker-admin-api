import { Context, invokeMethodWithInterceptors } from '@loopback/context';
import { RestBindings, HttpErrors } from '@loopback/rest';

import {
  requireOrganizationAccess,
  requireStaffRole,
} from './organizationAccess.interceptor';
import { Role } from '../types/roles';

class TestController {
  @requireStaffRole(Role.ADMIN, Role.LIST_TREE)
  allOrganizations(): string {
    return 'ok';
  }

  @requireOrganizationAccess(Role.ADMIN, Role.LIST_TREE)
  oneOrganization(organizationId: number): string {
    return `ok ${organizationId}`;
  }
}

/*
 * Mirrors what the Keycloak middleware attaches: realm roles as policies and
 * the organization_id claim as policy.organization.
 */
function contextWithUser(
  roles: string[] | undefined,
  organizationId?: number,
): Context {
  const ctx = new Context();
  const user =
    roles === undefined
      ? undefined
      : {
          id: 'u1',
          policy: {
            policies: roles.map((name) => ({ name })),
            organization:
              organizationId === undefined ? undefined : { id: organizationId },
          },
        };
  ctx.bind(RestBindings.Http.REQUEST.key).to({ user } as never);
  return ctx;
}

function invoke(
  ctx: Context,
  method: keyof TestController,
  args: number[] = [],
) {
  return invokeMethodWithInterceptors(ctx, new TestController(), method, args);
}

describe('requireStaffRole interceptor', () => {
  it('lets a staff member with an accepted role read every organization', async () => {
    await expect(
      invoke(contextWithUser([Role.LIST_TREE]), 'allOrganizations'),
    ).resolves.toBe('ok');
  });

  it('rejects an organizational user with 403', async () => {
    await expect(
      invoke(contextWithUser([Role.ORGANIZATION], 3483), 'allOrganizations'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('rejects a user who belongs to an organization even with an accepted role', async () => {
    await expect(
      invoke(contextWithUser([Role.LIST_TREE], 3483), 'allOrganizations'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('rejects a user without any role with 403', async () => {
    await expect(
      invoke(contextWithUser([]), 'allOrganizations'),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('throws 401 Unauthorized when there is no authenticated user', async () => {
    await expect(
      invoke(contextWithUser(undefined), 'allOrganizations'),
    ).rejects.toThrow(HttpErrors.Unauthorized);
  });
});

describe('requireOrganizationAccess interceptor', () => {
  it('lets an organizational user read their own organization', async () => {
    await expect(
      invoke(
        contextWithUser([Role.ORGANIZATION], 3483),
        'oneOrganization',
        [3483],
      ),
    ).resolves.toBe('ok 3483');
  });

  it('rejects an organizational user reading another organization with 403', async () => {
    await expect(
      invoke(
        contextWithUser([Role.ORGANIZATION], 3483),
        'oneOrganization',
        [1],
      ),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('lets a staff member with an accepted role read any organization', async () => {
    await expect(
      invoke(contextWithUser([Role.ADMIN]), 'oneOrganization', [1]),
    ).resolves.toBe('ok 1');
  });

  it('rejects a user without any role or organization with 403', async () => {
    await expect(
      invoke(contextWithUser([]), 'oneOrganization', [1]),
    ).rejects.toThrow(HttpErrors.Forbidden);
  });

  it('throws 401 Unauthorized when there is no authenticated user', async () => {
    await expect(
      invoke(contextWithUser(undefined), 'oneOrganization', [1]),
    ).rejects.toThrow(HttpErrors.Unauthorized);
  });
});
