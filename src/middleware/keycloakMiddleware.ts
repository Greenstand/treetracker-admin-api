import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Request, Response, NextFunction } from 'express';

export interface PolicyEntry {
  name: string;
}

export interface KeycloakOrganization {
  id: number;
}

export interface NormalizedUser {
  id: string;
  userName: string;
  email: string;
  policy: {
    policies: PolicyEntry[];
    organization: KeycloakOrganization | undefined;
  };
}

export interface KeycloakRequest extends Request {
  user?: NormalizedUser;
}

interface KeycloakTokenPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  azp?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
  organization_id?: string;
}

function getOrganizationId(payload: KeycloakTokenPayload): number | undefined {
  if (payload.organization_id === undefined) {
    return undefined;
  }

  const organizationId = Number(payload.organization_id);

  return Number.isNaN(organizationId) ? undefined : organizationId;
}

// Lazily initialized — createRemoteJWKSet is only called on the first request,
// so missing env vars at import time do not throw.
let JWKS: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!JWKS) {
    JWKS = createRemoteJWKSet(
      new URL(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
      ),
    );
  }
  return JWKS;
}

/**
 * Express middleware that validates a Keycloak bearer token using jose.
 *
 * On success, sets req.user with the shape the rest of the app expects:
 *   req.user.policy.policies      – [{ name: string }, ...]  (realm + client roles)
 *   req.user.policy.organization  – { id: number, name: string } | undefined
 *
 * Keycloak role names must match the app's policy names
 * (super_permission, list_tree, approve_tree, list_planter, etc.)
 * so that the existing permission checks in auth.js continue to work.
 *
 * Returns 401 for missing, invalid, or expired tokens.
 */
async function keycloakAuth(
  req: KeycloakRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const issuer = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;
  const expectedAuthorizedParty =
    process.env.KEYCLOAK_CLIENT_EXPECTED_CLIENT_ID;

  try {
    const { payload } = await jwtVerify<KeycloakTokenPayload>(
      token,
      getJWKS(),
      { issuer },
    );

    if (expectedAuthorizedParty && payload.azp !== expectedAuthorizedParty) {
      res.status(401).json({ error: 'Invalid token client' });
      return;
    }

    const realmRoles: string[] = payload.realm_access?.roles ?? [];
    const clientRoles: string[] =
      payload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID ?? '']?.roles ??
      [];
    const policies: PolicyEntry[] = [
      ...new Set([...realmRoles, ...clientRoles]),
    ].map((role) => ({ name: role }));
    const organizationId = getOrganizationId(payload);

    req.user = {
      id: payload.sub,
      userName: payload.preferred_username || payload.email || '',
      email: payload.email || '',
      policy: {
        policies,
        organization:
          organizationId !== undefined ? { id: organizationId } : undefined,
      },
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export { keycloakAuth };
