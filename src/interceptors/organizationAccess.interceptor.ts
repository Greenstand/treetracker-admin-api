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
 * Allows staff users with the supplied roles, but excludes organization users.
 * This is intended for endpoints that do not include an organization scope.
 */
export function requireStaffRole(
  ...roles: string[]
): ReturnType<typeof intercept> {
  return intercept(async (invocationCtx: InvocationContext, next: Next) => {
    const request = await getAuthenticatedRequest(invocationCtx);

    if (request.user?.policy.organization) {
      throw new HttpErrors.Forbidden(
        'Organizational users may only access their own organization',
      );
    }

    if (!hasRequiredRole(request, roles)) {
      throw new HttpErrors.Forbidden('Insufficient permissions');
    }

    return next();
  });
}

/**
 * Allows staff users with the supplied roles, or organization users with the
 * organization role when the route organization matches their token
 * organization.
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
        'Organizational users may only access their own organization',
      );
    }

    if (!hasRequiredRole(request, [...roles, Role.ORGANIZATION])) {
      throw new HttpErrors.Forbidden('Insufficient permissions');
    }

    return next();
  });
}
