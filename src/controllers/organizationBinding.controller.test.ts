import { OrganizationBindingController } from './organizationBinding.controller';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { OrganizationRepository } from '../repositories';
import {
  assignOrganizationRole,
  clearOrganizationBinding,
  getOrganizationBinding,
  listPendingBindings,
  rejectOrganizationBinding,
  requestOrganizationBinding,
  setOrganizationClaim,
} from '../services/keycloakAdminService';

jest.mock('../services/keycloakAdminService', () => ({
  assignOrganizationRole: jest.fn(),
  clearOrganizationBinding: jest.fn(),
  getOrganizationBinding: jest.fn(),
  listPendingBindings: jest.fn(),
  rejectOrganizationBinding: jest.fn(),
  requestOrganizationBinding: jest.fn(),
  setOrganizationClaim: jest.fn(),
}));

describe('OrganizationBindingController', () => {
  const organizationRepository = {
    findById: jest.fn(),
  } as unknown as OrganizationRepository;

  const controllerFor = (user: KeycloakRequest['user']) =>
    new OrganizationBindingController(organizationRepository, {
      user,
    } as KeycloakRequest);

  const member = { id: 'user-1', policy: { organization: { id: 7 } } };
  const outsider = { id: 'user-1', policy: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records a pending request for a user without an organization', async () => {
    (organizationRepository.findById as jest.Mock).mockResolvedValue({ id: 7 });

    const result = await controllerFor(
      outsider as KeycloakRequest['user'],
    ).create(7);

    expect(requestOrganizationBinding).toHaveBeenCalledWith('user-1', 7);
    expect(result).toEqual({ organizationId: 7, status: 'pending' });
  });

  it('rejects users who already belong to an organization', async () => {
    await expect(
      controllerFor(member as KeycloakRequest['user']).create(7),
    ).rejects.toThrow('User already belongs to an organization');
    expect(requestOrganizationBinding).not.toHaveBeenCalled();
  });

  it('grants the organization role on approval and clears the request', async () => {
    (getOrganizationBinding as jest.Mock).mockResolvedValue({
      organizationId: 7,
      status: 'pending',
    });

    await controllerFor(outsider as KeycloakRequest['user']).approve('user-2');

    expect(setOrganizationClaim).toHaveBeenCalledWith('user-2', 7);
    expect(assignOrganizationRole).toHaveBeenCalledWith('user-2');
    expect(clearOrganizationBinding).toHaveBeenCalledWith('user-2');
  });

  it('leaves the role alone on rejection', async () => {
    (getOrganizationBinding as jest.Mock).mockResolvedValue({
      organizationId: 7,
      status: 'pending',
    });

    await controllerFor(outsider as KeycloakRequest['user']).reject('user-2');

    expect(rejectOrganizationBinding).toHaveBeenCalledWith('user-2');
    expect(assignOrganizationRole).not.toHaveBeenCalled();
  });

  it('refuses to approve a user without a pending request', async () => {
    (getOrganizationBinding as jest.Mock).mockResolvedValue(null);

    await expect(
      controllerFor(outsider as KeycloakRequest['user']).approve('user-2'),
    ).rejects.toThrow('No pending request for this user');
    expect(setOrganizationClaim).not.toHaveBeenCalled();
  });

  it('lists a page of pending requests with the total', async () => {
    const page = {
      total: 120,
      requests: [
        {
          userId: 'user-2',
          username: 'u2',
          organizationId: 7,
          status: 'pending',
        },
      ],
    };
    (listPendingBindings as jest.Mock).mockResolvedValue(page);

    await expect(
      controllerFor(outsider as KeycloakRequest['user']).findPending(20, 10),
    ).resolves.toEqual(page);
    expect(listPendingBindings).toHaveBeenCalledWith(20, 10);
  });

  it('defaults to the first page', async () => {
    (listPendingBindings as jest.Mock).mockResolvedValue({
      total: 0,
      requests: [],
    });

    await controllerFor(outsider as KeycloakRequest['user']).findPending();

    expect(listPendingBindings).toHaveBeenCalledWith(0, 10);
  });
});
