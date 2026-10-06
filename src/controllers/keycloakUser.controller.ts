import { get, param, HttpErrors } from '@loopback/rest';

import { requireRole } from '../interceptors/requireRole.interceptor';
import {
  KeycloakUser,
  getUserById,
  searchUsers,
} from '../services/keycloakAdminService';
import { Role } from '../types/roles';

// Lets the admin panel find a keycloak account by email or username when
// binding it to a legacy wallet, so nobody has to copy a uuid by hand.
export class KeycloakUserController {
  @get('/keycloak-users', {
    responses: {
      '200': {
        description: 'Keycloak accounts matching the search term',
        content: {
          'application/json': {
            schema: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  @requireRole(Role.WALLET_ADMIN)
  async find(
    @param.query.string('search') search?: string,
    @param.query.number('limit') limit?: number,
  ): Promise<KeycloakUser[]> {
    if (!search?.trim()) {
      return [];
    }

    return searchUsers(search.trim(), limit ?? 10);
  }

  @get('/keycloak-users/{id}', {
    responses: {
      '200': {
        description: 'One keycloak account',
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    },
  })
  @requireRole(Role.WALLET_ADMIN)
  async findById(@param.path.string('id') id: string): Promise<KeycloakUser> {
    const user = await getUserById(id);

    if (!user) {
      throw new HttpErrors.NotFound(`Keycloak user "${id}" not found`);
    }

    return user;
  }
}
