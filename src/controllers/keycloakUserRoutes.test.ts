import request from 'supertest';

import { ExpressServer } from '../server';
import { KeycloakUserController } from './keycloakUser.controller';
import { getUserById } from '../services/keycloakAdminService';

const CLIENT_ID = 'treetracker-admin-client-fe';

// The auth middleware only mounts when keycloak is configured; jose is mocked.
process.env.KEYCLOAK_URL = 'https://keycloak.invalid';
process.env.KEYCLOAK_REALM = 'treetracker';
process.env.KEYCLOAK_CLIENT_EXPECTED_CLIENT_ID = CLIENT_ID;
jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  jwtVerify: jest.fn(async () => ({
    payload: {
      sub: 'me-uuid',
      preferred_username: 'org-manager',
      azp: 'treetracker-admin-client-fe',
      realm_access: { roles: ['greenstand-admin'] },
    },
  })),
}));

jest.mock('../services/keycloakAdminService', () => ({
  getUserById: jest.fn(),
  searchUsers: jest.fn(),
}));

const getUserByIdMock = getUserById as jest.MockedFunction<typeof getUserById>;

describe('GET /api/keycloak-users/me', () => {
  let server: ExpressServer;

  beforeAll(async () => {
    server = new ExpressServer({ rest: { port: 0 } });
    await server.boot();
    // The booter globs compiled controllers under dist, so register it here.
    server.lbApp.controller(KeycloakUserController);
    await server.lbApp.start();
  });

  afterAll(async () => {
    await server.lbApp.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getUserByIdMock.mockResolvedValue({
      id: 'me-uuid',
      username: 'org-manager',
      email: 'org@example.com',
      firstName: 'Org',
      lastName: 'Manager',
      createdTimestamp: 1700000000000,
    });
  });

  it('routes to findMe, not findById, and needs no wallet-admin role', async () => {
    const res = await request(server.app)
      .get('/api/keycloak-users/me')
      .set('Authorization', 'Bearer stub');

    expect(res.status).toBe(200);
    expect(getUserByIdMock).toHaveBeenCalledWith('me-uuid');
    expect(res.body.createdTimestamp).toBe(1700000000000);
  });

  it('still gates /keycloak-users/{id} on wallet-admin', async () => {
    const res = await request(server.app)
      .get('/api/keycloak-users/someone-else')
      .set('Authorization', 'Bearer stub');

    expect(res.status).toBe(403);
  });

  it('401s without a token', async () => {
    const res = await request(server.app).get('/api/keycloak-users/me');

    expect(res.status).toBe(401);
  });
});
