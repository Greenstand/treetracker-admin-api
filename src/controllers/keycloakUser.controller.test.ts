import { HttpErrors } from '@loopback/rest';

import { KeycloakUserController } from './keycloakUser.controller';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { getUserById, searchUsers } from '../services/keycloakAdminService';

jest.mock('../services/keycloakAdminService', () => ({
  getUserById: jest.fn(),
  searchUsers: jest.fn(),
}));

const searchUsersMock = searchUsers as jest.MockedFunction<typeof searchUsers>;
const getUserByIdMock = getUserById as jest.MockedFunction<typeof getUserById>;

describe('KeycloakUserController', () => {
  const request = {} as KeycloakRequest;
  const controller = new KeycloakUserController(request);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns nothing for an empty search, without calling keycloak', async () => {
    expect(await controller.find('   ')).toEqual([]);
    expect(await controller.find()).toEqual([]);
    expect(searchUsersMock).not.toHaveBeenCalled();
  });

  it('trims the search term and defaults the limit', async () => {
    searchUsersMock.mockResolvedValue([]);

    await controller.find('  grower@example.com  ');

    expect(searchUsersMock).toHaveBeenCalledWith('grower@example.com', 10);
  });

  it('passes an explicit limit through', async () => {
    searchUsersMock.mockResolvedValue([]);

    await controller.find('grower', 3);

    expect(searchUsersMock).toHaveBeenCalledWith('grower', 3);
  });

  it('404s when the account does not exist', async () => {
    getUserByIdMock.mockResolvedValue(null);

    await expect(controller.findById('missing')).rejects.toBeInstanceOf(
      HttpErrors.NotFound,
    );
  });

  it('returns the account when it exists', async () => {
    const user = {
      id: 'abc',
      username: 'grower',
      email: 'grower@example.com',
      firstName: 'Gro',
      lastName: 'Wer',
    };
    getUserByIdMock.mockResolvedValue(user);

    expect(await controller.findById('abc')).toEqual(user);
  });
});

function controllerForUser(id: string | undefined) {
  const request = (id ? { user: { id } } : {}) as KeycloakRequest;
  return new KeycloakUserController(request);
}

describe('KeycloakUserController.findMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads the account named by the verified token', async () => {
    getUserByIdMock.mockResolvedValue({
      id: 'abc',
      username: 'org-manager',
      email: 'org@example.com',
      firstName: 'Org',
      lastName: 'Manager',
      createdTimestamp: 1700000000000,
    });

    const user = await controllerForUser('abc').findMe();

    expect(getUserByIdMock).toHaveBeenCalledWith('abc');
    expect(user.createdTimestamp).toBe(1700000000000);
  });

  it('401s when the request carries no user', async () => {
    await expect(controllerForUser(undefined).findMe()).rejects.toThrow(
      HttpErrors.Unauthorized,
    );
    expect(getUserByIdMock).not.toHaveBeenCalled();
  });

  it('404s when keycloak has no such account', async () => {
    getUserByIdMock.mockResolvedValue(null);

    await expect(controllerForUser('gone').findMe()).rejects.toThrow(
      HttpErrors.NotFound,
    );
  });
});
