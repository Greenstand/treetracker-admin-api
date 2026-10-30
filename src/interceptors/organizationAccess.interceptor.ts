import { intercept, InvocationContext, Next } from '@loopback/context';
import { HttpErrors, RestBindings } from '@loopback/rest';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { Role } from '../types/roles';
import { hasRequiredRole } from './requireRole.interceptor';

async function getAuthenticatedRequest(
  invocationCtx: InvocationContext,
): Promise<KeycloakRequest> {
  const request = await invocationCtx.get<KeycloakRequest>(
    RestBindings.Http.REQUEST,
    { optional: true },
  );

  if (!request?.user) {
    throw new HttpErrors.Unauthorized('Missing authenticated user');
  }

  return request;
}

/**
 * Guards routes that read data across every organization.
 *
 * Organizational users are refused even when they hold an accepted role,
 * because these routes apply no organization filter. They read their own
 * data through the /organization/{organizationId} routes instead.
 */
export function requireStaffRole(
  ...roles: string[]
): ReturnType<typeof intercept> {
  return intercept(async (invocationCtx: InvocationContext, next: Next) => {
    const request = await getAuthenticatedRequest(invocationCtx);

    if (request.user?.policy.organization) {
      throw new HttpErrors.Forbidden(
        'Organizational users may only read their own organization',
      );
    }

    if (!hasRequiredRole(request, roles)) {
      throw new HttpErrors.Forbidden('Insufficient permissions');
    }

    return next();
  });
}

/**
 * Guards routes under /organization/{organizationId}.
 *
 * The decorated method must take organizationId as its first argument.
 * An organizational user may only read the organization in their token;
 * a staff member with one of the given roles may read any organization.
 */
export function requireOrganizationAccess(
  ...roles: string[]
): ReturnType<typeof intercept> {
  return intercept(async (invocationCtx: InvocationContext, next: Next) => {
    const request = await getAuthenticatedRequest(invocationCtx);
    const userOrganization = request.user?.policy.organization;

    if (!userOrganization) {
      if (!hasRequiredRole(request, roles)) {
        throw new HttpErrors.Forbidden('Insufficient permissions');
      }
      return next();
    }

    const [organizationId] = invocationCtx.args;

    if (organizationId !== userOrganization.id) {
      throw new HttpErrors.Forbidden(
        'Organizational users may only read their own organization',
      );
    }

    if (!hasRequiredRole(request, [...roles, Role.ORGANIZATION])) {
      throw new HttpErrors.Forbidden('Insufficient permissions');
    }

    return next();
  });
}
