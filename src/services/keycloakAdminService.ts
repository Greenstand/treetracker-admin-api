import KcAdminClient from '@keycloak/keycloak-admin-client';
import { Role } from '../types/roles';

export interface KeycloakRole {
  id: string;
  name: string;
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
