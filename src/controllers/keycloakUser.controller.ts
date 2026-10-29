import { inject } from '@loopback/core';
import { get, param, HttpErrors, RestBindings } from '@loopback/rest';

import { requireRole } from '../interceptors/requireRole.interceptor';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import {
  KeycloakUser,
  getUserById,
  searchUsers,
} from '../services/keycloakAdminService';
import { Role } from '../types/roles';

export class KeycloakUserController {
  constructor(
    @inject(RestBindings.Http.REQUEST)
    private request: KeycloakRequest,
  ) {}

  // No role gate: the id comes from the verified token, never the caller.
  @get('/keycloak-users/me', {
    responses: {
      '200': {
        description: "The caller's own keycloak account",
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    },
  })
  async findMe(): Promise<KeycloakUser> {
    const id = this.request.user?.id;

    if (!id) {
      throw new HttpErrors.Unauthorized('Missing authenticated user');
    }

    const user = await getUserById(id);

    if (!user) {
      throw new HttpErrors.NotFound(`Keycloak user "${id}" not found`);
    }

    return user;
  }

  // Lets the admin panel find a keycloak account by email or username when
  // binding it to a legacy wallet, so nobody has to copy a uuid by hand.
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
