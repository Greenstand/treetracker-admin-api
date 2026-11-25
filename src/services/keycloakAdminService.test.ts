import {
  clearOrganizationBinding,
  getOrganizationBinding,
  rejectOrganizationBinding,
  requestOrganizationBinding,
} from './keycloakAdminService';

const findOne = jest.fn();
const update = jest.fn();

jest.mock('@keycloak/keycloak-admin-client', () =>
  jest.fn().mockImplementation(() => ({
    auth: jest.fn(),
    users: { findOne, update },
  })),
);

// The stored attribute map, as keycloak would hold it between calls.
let attributes: Record<string, string[]>;

describe('organization binding attributes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KEYCLOAK_URL = 'http://keycloak';
    process.env.KEYCLOAK_REALM = 'treetracker';
    process.env.KEYCLOAK_ADMIN_ID = 'admin';
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = 'secret';

    attributes = {};
    findOne.mockImplementation(async () => ({ id: 'user-1', attributes }));
    update.mockImplementation(async (_target, user) => {
      attributes = user.attributes;
    });
  });

  it('stores the proposed organization fields with the request', async () => {
    const binding = await requestOrganizationBinding('user-1', 7, {
      phone: ' +1 555 0100 ',
      location: 'Sierra Leone',
    });

    expect(attributes).toMatchObject({
      organization_binding_request: ['7'],
      organization_binding_status: ['pending'],
      organization_binding_phone: ['+1 555 0100'],
      organization_binding_location: ['Sierra Leone'],
    });
    expect(attributes.organization_binding_email).toBeUndefined();
    expect(binding).toEqual({
      organizationId: 7,
      status: 'pending',
      proposed: { phone: '+1 555 0100', location: 'Sierra Leone' },
    });
  });

  it('drops values left by an earlier request', async () => {
    await requestOrganizationBinding('user-1', 7, { phone: '+1 555 0100' });
    await requestOrganizationBinding('user-1', 7, {});

    expect(attributes.organization_binding_phone).toBeUndefined();
    await expect(getOrganizationBinding('user-1')).resolves.toEqual({
      organizationId: 7,
      status: 'pending',
      proposed: {},
    });
  });

  it('fails when the realm drops the proposed fields', async () => {
    update.mockImplementation(async () => {
      attributes = {
        organization_binding_request: ['7'],
        organization_binding_status: ['pending'],
      };
    });

    await expect(
      requestOrganizationBinding('user-1', 7, { phone: '+1 555 0100' }),
    ).rejects.toThrow('rejects unmanaged attributes');
  });

  it('drops the proposed values when the request is rejected', async () => {
    await requestOrganizationBinding('user-1', 7, { location: 'Kenya' });
    await rejectOrganizationBinding('user-1');

    await expect(getOrganizationBinding('user-1')).resolves.toEqual({
      organizationId: 7,
      status: 'rejected',
      proposed: {},
    });
  });

  it('clears every binding attribute', async () => {
    await requestOrganizationBinding('user-1', 7, {
      phone: '+1 555 0100',
      email: 'org@example.org',
      location: 'Kenya',
    });
    await clearOrganizationBinding('user-1');

    expect(attributes).toEqual({});
    await expect(getOrganizationBinding('user-1')).resolves.toBeNull();
  });
});
