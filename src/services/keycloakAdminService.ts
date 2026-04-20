import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { Role } from '../types/roles';

interface KeycloakRole {
  id: string;
  name: string;
}

interface KeycloakUserRepresentation {
  id?: string;
  username?: string;
  attributes?: Record<string, string[] | string>;
  [key: string]: unknown;
}

// Cached after first fetch — role IDs are stable for the lifetime of the realm
let cachedOrganizationRole: KeycloakRole | undefined;

function request(
  url: string,
  options: { method: string; headers: Record<string, string>; body?: string },
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: options.method,
        headers: {
          ...options.headers,
          ...(options.body
            ? { 'Content-Length': Buffer.byteLength(options.body) }
            : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({ status: res.statusCode ?? 0, body: data }),
        );
      },
    );

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

/**
 * Obtains a short-lived admin access token using the backend client's
 * service account (client_credentials grant).
 *
 * Requires the Keycloak client to have "Service Accounts Enabled" and
 * its service account must hold the `manage-users` role from realm-management.
 */

async function getAdminToken(): Promise<string> {
  // u need to enable it first and this is how i enabled it
  //   Step 1 — Go to the Settings tab (you should already be on it)
  // Scroll down until you see a section called Capability config. You'll see a set of toggles. Enable this one:

  // Service account roles    [ OFF → ON ]

  // Click Save at the bottom.

  // ---
  // Step 2 — Assign the role to the service account

  // After saving, a new tab called Service account roles will appear at the top. Click it.

  // Then:
  // 1. Click Assign role
  // 2. Change the filter from Filter by realm roles → Filter by clients
  // 3. Search for realm-management
  // 4. Find manage-users in the list → tick it → click Assign

  // ---
  // Step 3 — Get the client secret

  // Go to the Credentials tab (next to Service account roles).

  // Copy the value under Client secret and paste it into your .env:

  // KEYCLOAK_ADMIN_CLIENT_SECRET=<paste here>

  // ---
  // That's it. Once those three steps are done, getAdminToken() in keycloakAdminService.ts will be able to fetch an admin token automatically
  // whenever a user creates an organization.

  const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.KEYCLOAK_ADMIN_ID ?? '',
    client_secret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET ?? '',
  }).toString();

  const { status, body: responseBody } = await request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (status !== 200) {
    throw new Error(
      `Failed to obtain Keycloak admin token: HTTP ${status} — ${responseBody}`,
    );
  }

  const parsed = JSON.parse(responseBody);
  return parsed.access_token as string;
}

async function getRealmRole(
  adminToken: string,
  roleName: string,
): Promise<KeycloakRole> {
  const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles/${roleName}`;

  const { status, body } = await request(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (status !== 200) {
    throw new Error(
      `Failed to fetch Keycloak role "${roleName}": HTTP ${status} — ${body}`,
    );
  }

  const role = JSON.parse(body);
  return { id: role.id as string, name: role.name as string };
}

async function assignRoleToUser(
  adminToken: string,
  userId: string,
  role: KeycloakRole,
): Promise<void> {
  const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`;
  const body = JSON.stringify([{ id: role.id, name: role.name }]);

  const { status, body: responseBody } = await request(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  // 204 No Content is the success response for role assignment
  if (status !== 204) {
    throw new Error(
      `Failed to assign role "${role.name}" to user "${userId}": HTTP ${status} — ${responseBody}`,
    );
  }
}

async function getUserRepresentation(
  adminToken: string,
  userId: string,
): Promise<KeycloakUserRepresentation> {
  const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`;

  const { status, body } = await request(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (status !== 200) {
    throw new Error(
      `Failed to fetch Keycloak user "${userId}": HTTP ${status} — ${body}`,
    );
  }

  return JSON.parse(body) as KeycloakUserRepresentation;
}

async function updateUserRepresentation(
  adminToken: string,
  userId: string,
  user: KeycloakUserRepresentation,
): Promise<void> {
  const url = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`;
  const body = JSON.stringify(user);

  const { status, body: responseBody } = await request(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  console.log('status user claim', status, body);

  if (status !== 204) {
    throw new Error(
      `Failed to update Keycloak user "${userId}": HTTP ${status} — ${responseBody}`,
    );
  }
}

export async function setOrganizationClaim(
  userId: string,
  organizationId: number,
): Promise<void> {
  const adminToken = await getAdminToken();
  const user = await getUserRepresentation(adminToken, userId);
  const currentAttributes = user.attributes || {};

  await updateUserRepresentation(adminToken, userId, {
    ...user,
    attributes: {
      ...currentAttributes,
      organization_id: [String(organizationId)],
    },
  });
}

export async function assignOrganizationRole(userId: string): Promise<void> {
  const adminToken = await getAdminToken();

  if (!cachedOrganizationRole) {
    cachedOrganizationRole = await getRealmRole(adminToken, Role.ORGANIZATION);
  }

  await assignRoleToUser(adminToken, userId, cachedOrganizationRole);
}
