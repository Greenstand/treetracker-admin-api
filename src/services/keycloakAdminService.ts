import KcAdminClient from '@keycloak/keycloak-admin-client';
import { Role } from '../types/roles';

export interface KeycloakRole {
  id: string;
  name: string;
}

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  // Epoch milliseconds, as keycloak reports it.
  createdTimestamp?: number;
}

export function assertKeycloakConfigured(): void {
  if (
    !process.env.KEYCLOAK_URL ||
    !process.env.KEYCLOAK_REALM ||
    !process.env.KEYCLOAK_ADMIN_ID ||
    !process.env.KEYCLOAK_ADMIN_CLIENT_SECRET
  ) {
    throw new Error('Keycloak admin is not configured');
  }
}

async function getAuthedClient(): Promise<KcAdminClient> {
  assertKeycloakConfigured();

  const client = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL,
    realmName: process.env.KEYCLOAK_REALM,
  });

  await client.auth({
    grantType: 'client_credentials',
    clientId: process.env.KEYCLOAK_ADMIN_ID as string,
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
  });

  return client;
}

async function getRealmRole(
  client: KcAdminClient,
  roleName: string,
): Promise<KeycloakRole> {
  const role = await client.roles.findOneByName({ name: roleName });
  if (!role?.id || !role.name) {
    throw new Error(`Keycloak role "${roleName}" not found`);
  }

  const value = { id: role.id, name: role.name };
  return value;
}

export async function setOrganizationClaim(
  userId: string,
  organizationId: number,
): Promise<void> {
  const client = await getAuthedClient();
  const user = await client.users.findOne({ id: userId });
  if (!user) {
    throw new Error(`Keycloak user "${userId}" not found`);
  }

  await client.users.update(
    { id: userId },
    {
      ...user,
      attributes: {
        ...(user.attributes ?? {}),
        organization_id: [String(organizationId)],
      },
    },
  );
}

export async function assignRoleByName(
  userId: string,
  roleName: string,
): Promise<void> {
  const client = await getAuthedClient();
  const role = await getRealmRole(client, roleName);

  await client.users.addRealmRoleMappings({
    id: userId,
    roles: [{ id: role.id, name: role.name }],
  });
}

export async function assignOrganizationRole(userId: string): Promise<void> {
  await assignRoleByName(userId, Role.ORGANIZATION);
}

export async function searchUsers(
  search: string,
  max = 10,
): Promise<KeycloakUser[]> {
  const client = await getAuthedClient();
  const users = await client.users.find({ search, max });

  return users
    .filter((user): user is typeof user & { id: string } => Boolean(user.id))
    .map((user) => ({
      id: user.id,
      username: user.username ?? '',
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    }));
}

export async function getUserById(
  userId: string,
): Promise<KeycloakUser | null> {
  const client = await getAuthedClient();
  const user = await client.users.findOne({ id: userId });

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    username: user.username ?? '',
    email: user.email ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    createdTimestamp: user.createdTimestamp,
  };
}

const BINDING_ORGANIZATION_ATTRIBUTE = 'organization_binding_request';
const BINDING_STATUS_ATTRIBUTE = 'organization_binding_status';

export type BindingStatus = 'pending' | 'rejected';

export interface OrganizationBinding {
  organizationId: number;
  status: BindingStatus;
}

export interface BindingRequest extends OrganizationBinding {
  userId: string;
  username: string;
}

// Keycloak replaces the whole attribute map on update, so read first and merge.
// A null value drops the attribute.
async function updateAttributes(
  userId: string,
  changes: Record<string, string | null>,
): Promise<void> {
  const client = await getAuthedClient();
  const user = await client.users.findOne({ id: userId });
  if (!user) {
    throw new Error(`Keycloak user "${userId}" not found`);
  }

  const attributes = { ...(user.attributes ?? {}) };
  Object.entries(changes).forEach(([key, value]) => {
    if (value === null) {
      delete attributes[key];
    } else {
      attributes[key] = [value];
    }
  });

  await client.users.update({ id: userId }, { ...user, attributes });
}

function readBinding(
  attributes: Record<string, unknown> | undefined,
): OrganizationBinding | null {
  const organizationId = Number(
    (attributes?.[BINDING_ORGANIZATION_ATTRIBUTE] as string[])?.[0],
  );
  const status = (attributes?.[BINDING_STATUS_ATTRIBUTE] as string[])?.[0];

  if (!organizationId || (status !== 'pending' && status !== 'rejected')) {
    return null;
  }

  return { organizationId, status };
}

export async function requestOrganizationBinding(
  userId: string,
  organizationId: number,
): Promise<void> {
  await updateAttributes(userId, {
    [BINDING_ORGANIZATION_ATTRIBUTE]: String(organizationId),
    [BINDING_STATUS_ATTRIBUTE]: 'pending',
  });

  // A realm that disallows unmanaged attributes drops these without an error,
  // which would leave the user waiting on a request nothing recorded.
  const stored = await getOrganizationBinding(userId);
  if (stored?.organizationId !== organizationId) {
    throw new Error(
      'Keycloak did not store the binding request; the realm user profile rejects unmanaged attributes',
    );
  }
}

export async function getOrganizationBinding(
  userId: string,
): Promise<OrganizationBinding | null> {
  const client = await getAuthedClient();
  const user = await client.users.findOne({ id: userId });

  return readBinding(user?.attributes);
}

// Keycloak only matches attributes exactly, which is why the status is its own
// attribute: one query returns every pending request. It also caps results at
// 100 when max is not given, so skip and limit are always passed.
export async function listPendingBindings(
  skip: number,
  limit: number,
): Promise<{ total: number; requests: BindingRequest[] }> {
  const client = await getAuthedClient();
  const query = { q: `${BINDING_STATUS_ATTRIBUTE}:pending` };

  const [total, users] = await Promise.all([
    client.users.count(query),
    client.users.find({ ...query, first: skip, max: limit }),
  ]);

  const requests = users.flatMap((user) => {
    const binding = user.id ? readBinding(user.attributes) : null;

    return binding
      ? [
          {
            ...binding,
            userId: user.id as string,
            username: user.username ?? '',
          },
        ]
      : [];
  });

  return { total, requests };
}

export async function clearOrganizationBinding(userId: string): Promise<void> {
  await updateAttributes(userId, {
    [BINDING_ORGANIZATION_ATTRIBUTE]: null,
    [BINDING_STATUS_ATTRIBUTE]: null,
  });
}

export async function rejectOrganizationBinding(userId: string): Promise<void> {
  await updateAttributes(userId, { [BINDING_STATUS_ATTRIBUTE]: 'rejected' });
}
