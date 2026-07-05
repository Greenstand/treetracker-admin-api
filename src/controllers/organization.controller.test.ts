import { validateValueAgainstSchema } from '@loopback/rest';

import {
  ORGANIZATION_REQUEST_SCHEMA,
  ORGANIZATION_UPDATE_REQUEST_SCHEMA,
} from '../dto/organization-dto';
import { OrganizationController } from './organization.controller';
import { ErrorCode } from '../types/error-codes';
import { Role } from '../types/roles';
import {
  assignOrganizationRole,
  setOrganizationClaim,
} from '../services/keycloakAdminService';

jest.mock('../services/keycloakAdminService', () => ({
  assignOrganizationRole: jest.fn(),
  setOrganizationClaim: jest.fn(),
}));

describe('OrganizationController', () => {
  const originalEnv = process.env;
  const validateOrganization = (value: object) =>
    validateValueAgainstSchema(
      value,
      ORGANIZATION_REQUEST_SCHEMA,
      {},
      { source: 'body', ajvErrors: {} },
    );
  const validateOrganizationUpdate = (value: object) =>
    validateValueAgainstSchema(
      value,
      ORGANIZATION_UPDATE_REQUEST_SCHEMA,
      {},
      { source: 'body', ajvErrors: {} },
    );

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('delegates organization creation to the repository', async () => {
    const createOrganization = jest.fn().mockResolvedValue({
      id: 178,
      type: 'O',
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      pwdResetRequired: false,
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new OrganizationController({
      createOrganization,
      dataSource: {
        beginTransaction: jest.fn().mockResolvedValue(transaction),
      },
    } as never);

    const result = await controller.create({
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });

    expect(createOrganization).toHaveBeenCalledWith(
      {
        name: 'FCC',
        email: 'fcc@example.com',
        phone: '+232 123 4567',
        website: 'https://fcc.example.com',
        logoUrl: 'https://fcc.example.com/logo.png',
        mapName: 'freetown',
      },
      {
        transaction,
      },
    );
    expect(result).toMatchObject({
      id: 178,
      type: 'O',
      name: 'FCC',
      email: 'fcc@example.com',
      phone: '+232 123 4567',
      pwdResetRequired: false,
      website: 'https://fcc.example.com',
      logoUrl: 'https://fcc.example.com/logo.png',
      mapName: 'freetown',
    });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  it('returns paginated organizations with a total for the same where filter', async () => {
    const organizations = [
      { id: 1, type: 'O', name: 'Alpha' },
      { id: 2, type: 'O', name: 'Beta' },
    ];
    const find = jest.fn().mockResolvedValue(organizations);
    const count = jest.fn().mockResolvedValue({ count: 7 });
    const controller = new OrganizationController({
      find,
      count,
    } as never);

    const filter = {
      where: { type: 'O' },
      order: ['name ASC'],
      skip: 0,
      limit: 2,
    };

    const result = await controller.findPaginated(filter as never);

    // List honours the full filter; count uses only the `where` clause.
    expect(find).toHaveBeenCalledWith(filter);
    expect(count).toHaveBeenCalledWith(filter.where);
    expect(result).toEqual({ organizations, total: 7 });
  });

  it('merges a name/phone search into the where, AND-ed with the existing filter', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue({ count: 0 });
    const controller = new OrganizationController({ find, count } as never);

    const filter = { where: { type: 'O' }, limit: 10 };

    await controller.findPaginated(filter as never, 'Free');

    const expectedFilter = {
      where: {
        and: [
          { type: 'O' },
          {
            or: [{ name: { ilike: '%Free%' } }, { phone: { ilike: '%Free%' } }],
          },
        ],
      },
      limit: 10,
    };
    expect(find).toHaveBeenCalledWith(expectedFilter);
    expect(count).toHaveBeenCalledWith(expectedFilter.where);
  });

  it('escapes LIKE wildcards in the search term', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue({ count: 0 });
    const controller = new OrganizationController({ find, count } as never);

    await controller.findPaginated(undefined, '50%_off');

    expect(find).toHaveBeenCalledWith({
      where: {
        or: [
          { name: { ilike: '%50\\%\\_off%' } },
          { phone: { ilike: '%50\\%\\_off%' } },
        ],
      },
    });
  });

  it('ignores a blank search term', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue({ count: 0 });
    const controller = new OrganizationController({ find, count } as never);

    const filter = { where: { type: 'O' } };
    await controller.findPaginated(filter as never, '   ');

    // No search clause merged; the original filter is used as-is.
    expect(find).toHaveBeenCalledWith(filter);
    expect(count).toHaveBeenCalledWith(filter.where);
  });

  it('rejects users who already have the organization role', async () => {
    const createOrganization = jest.fn();
    const controller = new OrganizationController(
      {
        createOrganization,
        dataSource: {
          beginTransaction: jest.fn(),
        },
      } as never,
      {
        user: {
          id: 'user-1',
          policy: {
            policies: [{ name: Role.ORGANIZATION }],
          },
        },
      } as never,
    );

    await expect(
      controller.create({
        name: 'FCC',
        email: 'fcc@example.com',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.ORGANIZATION_ROLE_ALREADY_ASSIGNED,
    });

    expect(createOrganization).not.toHaveBeenCalled();
  });

  it('assigns organization role and commits when keycloak env is configured', async () => {
    process.env.KEYCLOAK_URL = 'https://dev-k8s.treetracker.org/keycloak';
    process.env.KEYCLOAK_ADMIN_ID = 'treetracker-admin-client-be';
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = 'secret';

    const createOrganization = jest.fn().mockResolvedValue({
      id: 178,
      name: 'FCC',
    });
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    (assignOrganizationRole as jest.Mock).mockResolvedValue(undefined);
    (setOrganizationClaim as jest.Mock).mockResolvedValue(undefined);

    const controller = new OrganizationController(
      {
        createOrganization,
        dataSource: {
          beginTransaction: jest.fn().mockResolvedValue(transaction),
        },
      } as never,
      {
        user: {
          id: 'user-123',
          policy: {
            policies: [],
          },
        },
      } as never,
    );

    await controller.create({
      name: 'FCC',
      email: 'fcc@example.com',
    });

    expect(setOrganizationClaim).toHaveBeenCalledWith('user-123', 178);
    expect(assignOrganizationRole).toHaveBeenCalledWith('user-123');
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  it('rolls back and returns error code when claim update fails', async () => {
    process.env.KEYCLOAK_URL = 'https://dev-k8s.treetracker.org/keycloak';
    process.env.KEYCLOAK_ADMIN_ID = 'treetracker-admin-client-be';
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = 'secret';

    const createOrganization = jest.fn().mockResolvedValue({
      id: 178,
      name: 'FCC',
    });
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    (setOrganizationClaim as jest.Mock).mockRejectedValue(
      new Error('claim failure'),
    );

    const controller = new OrganizationController(
      {
        createOrganization,
        dataSource: {
          beginTransaction: jest.fn().mockResolvedValue(transaction),
        },
      } as never,
      {
        user: {
          id: 'user-123',
          policy: {
            policies: [],
          },
        },
      } as never,
    );

    await expect(
      controller.create({
        name: 'FCC',
        email: 'fcc@example.com',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.ORGANIZATION_CLAIM_UPDATE_FAILED,
    });

    expect(assignOrganizationRole).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('rolls back and returns error code when role assignment fails', async () => {
    process.env.KEYCLOAK_URL = 'https://dev-k8s.treetracker.org/keycloak';
    process.env.KEYCLOAK_ADMIN_ID = 'treetracker-admin-client-be';
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = 'secret';

    const createOrganization = jest.fn().mockResolvedValue({
      id: 178,
      name: 'FCC',
    });
    const transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    (assignOrganizationRole as jest.Mock).mockRejectedValue(
      new Error('role failure'),
    );
    (setOrganizationClaim as jest.Mock).mockResolvedValue(undefined);

    const controller = new OrganizationController(
      {
        createOrganization,
        dataSource: {
          beginTransaction: jest.fn().mockResolvedValue(transaction),
        },
      } as never,
      {
        user: {
          id: 'user-123',
          policy: {
            policies: [],
          },
        },
      } as never,
    );

    await expect(
      controller.create({
        name: 'FCC',
        email: 'fcc@example.com',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.ORGANIZATION_ROLE_ASSIGNMENT_FAILED,
    });

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('delegates organization update to the repository', async () => {
    const updateOrganization = jest.fn().mockResolvedValue({
      id: 178,
      type: 'O',
      name: 'FCC Renamed',
      email: 'fcc@example.com',
    });
    const controller = new OrganizationController({
      updateOrganization,
    } as never);

    const result = await controller.updateById(178, {
      name: 'FCC Renamed',
    });

    expect(updateOrganization).toHaveBeenCalledWith(178, {
      name: 'FCC Renamed',
    });
    expect(result).toMatchObject({
      id: 178,
      name: 'FCC Renamed',
    });
  });

  it('throws 404 when the organization to update does not exist', async () => {
    const updateOrganization = jest.fn().mockResolvedValue(null);
    const controller = new OrganizationController({
      updateOrganization,
    } as never);

    await expect(
      controller.updateById(999, { name: 'Missing Org' }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  describe('update request schema', () => {
    it('accepts a partial payload', async () => {
      await expect(
        validateOrganizationUpdate({
          name: 'FCC Renamed',
        }),
      ).resolves.toMatchObject({
        name: 'FCC Renamed',
      });
    });

    it('rejects an empty payload', async () => {
      await expect(validateOrganizationUpdate({})).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'At least one organization field is required',
          }),
        ]),
      });
    });

    it('rejects unsupported fields', async () => {
      await expect(
        validateOrganizationUpdate({
          name: 'FCC',
          extra: 'nope',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Only supported organization fields are allowed',
          }),
        ]),
      });
    });

    it('applies the same per-field validation as create', async () => {
      await expect(
        validateOrganizationUpdate({
          email: 'not-an-email',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Email must be a valid email address',
          }),
        ]),
      });
    });
  });

  describe('request schema', () => {
    it('accepts valid organization payloads', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '+232 123 4567',
          website: 'https://fcc.example.com',
          logoUrl: '',
          mapName: 'freetown',
        }),
      ).resolves.toMatchObject({
        name: 'FCC',
        phone: '+232 123 4567',
        website: 'https://fcc.example.com',
      });
    });

    it('accepts blank optional fields', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '',
          website: '',
          logoUrl: '',
          mapName: '',
        }),
      ).resolves.toMatchObject({
        name: 'FCC',
        phone: '',
        website: '',
        logoUrl: '',
        mapName: '',
      });
    });

    it('rejects missing required fields', async () => {
      await expect(
        validateOrganization({
          phone: '+232 123 4567',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({ message: 'Name is required' }),
          expect.objectContaining({ message: 'Email is required' }),
        ]),
      });
    });

    it('rejects firstName and lastName fields', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          firstName: 'checking',
          lastName: 'person',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Only supported organization fields are allowed',
          }),
        ]),
      });
    });

    it('rejects unsupported fields', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          extra: 'nope',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Only supported organization fields are allowed',
          }),
        ]),
      });
    });

    it('rejects invalid website values', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          website: 'not-a-url',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Website must be empty or a valid URL',
          }),
        ]),
      });
    });

    it('rejects phone numbers with fewer than 10 digits with one clear error', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '0311350',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [
          expect.objectContaining({
            path: '/phone',
            code: 'errorMessage',
            message: 'Phone must be empty or a valid phone number',
          }),
        ],
      });
    });

    it('rejects phone numbers with invalid characters', async () => {
      await expect(
        validateOrganization({
          name: 'FCC',
          email: 'fcc@example.com',
          phone: '12345abcde',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Phone must be empty or a valid phone number',
          }),
        ]),
      });
    });
  });
});
