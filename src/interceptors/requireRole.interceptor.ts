import { intercept, InvocationContext, Next } from '@loopback/context';
import { HttpErrors, RestBindings } from '@loopback/rest';
import { KeycloakRequest, PolicyEntry } from '../middleware/keycloakMiddleware';

function hasRequiredRole(
  request: KeycloakRequest | undefined,
  roles: string[],
): boolean {
  const policies: PolicyEntry[] = request?.user?.policy?.policies ?? [];

  return roles.some((role) => policies.some((policy) => policy.name === role));
}

export function requireRole(...roles: string[]): ReturnType<typeof intercept> {
  return intercept(async (invocationCtx: InvocationContext, next: Next) => {
    const request = await invocationCtx.get<KeycloakRequest>(
      RestBindings.Http.REQUEST,
      { optional: true },
    );

    console.log('requser', request?.user?.policy.policies);
    if (!request?.user) {
      throw new HttpErrors.Unauthorized('Missing authenticated user');
    }

    if (!hasRequiredRole(request, roles)) {
      throw new HttpErrors.Forbidden('Insufficient permissions');
    }

    console.log('requ passed');

    return next();
  });
}
