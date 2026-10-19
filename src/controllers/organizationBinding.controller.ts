import { get, post, param, HttpErrors, RestBindings } from '@loopback/rest';
import { inject } from '@loopback/context';
import { repository } from '@loopback/repository';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { requireRole } from '../interceptors/requireRole.interceptor';
import { Role } from '../types/roles';
import { OrganizationRepository } from '../repositories';
import {
  BindingRequest,
  OrganizationBinding,
  assignOrganizationRole,
  clearOrganizationBinding,
  getOrganizationBinding,
  listPendingBindings,
  rejectOrganizationBinding,
  requestOrganizationBinding,
  setOrganizationClaim,
} from '../services/keycloakAdminService';

const DEFAULT_PAGE_SIZE = 10;

const BINDING_RESPONSE = {
  '200': {
    description: 'Organization binding request',
    content: { 'application/json': { schema: { type: 'object' } } },
  },
};

export class OrganizationBindingController {
  constructor(
    @repository(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @inject(RestBindings.Http.REQUEST, { optional: true })
    private request?: KeycloakRequest,
  ) {}

  private currentUserId(): string {
    const userId = this.request?.user?.id;
    if (!userId) {
      throw new HttpErrors.Unauthorized('Missing authenticated user');
    }

    return userId;
  }

  private hasOrganization(): boolean {
    return Boolean(this.request?.user?.policy?.organization?.id);
  }

  @post('/organizations/{id}/binding-requests', {
    responses: BINDING_RESPONSE,
  })
  async create(
    @param.path.number('id') id: number,
  ): Promise<OrganizationBinding> {
    if (this.hasOrganization()) {
      throw new HttpErrors.Forbidden('User already belongs to an organization');
    }

    // Raises 404 when the organization does not exist.
    await this.organizationRepository.findById(id);
    await requestOrganizationBinding(this.currentUserId(), id);

    return { organizationId: id, status: 'pending' };
  }

  @get('/organizations/binding-requests/me', { responses: BINDING_RESPONSE })
  async findMine(): Promise<OrganizationBinding | null> {
    return getOrganizationBinding(this.currentUserId());
  }

  @get('/organizations/binding-requests', { responses: BINDING_RESPONSE })
  @requireRole(Role.ADMIN)
  async findPending(
    @param.query.number('skip') skip = 0,
    @param.query.number('limit') limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ total: number; requests: BindingRequest[] }> {
    return listPendingBindings(skip, limit);
  }

  @post('/organizations/binding-requests/{userId}/approve', {
    responses: BINDING_RESPONSE,
  })
  @requireRole(Role.ADMIN)
  async approve(
    @param.path.string('userId') userId: string,
  ): Promise<{ organizationId: number }> {
    const binding = await getOrganizationBinding(userId);
    if (binding?.status !== 'pending') {
      throw new HttpErrors.NotFound('No pending request for this user');
    }

    await setOrganizationClaim(userId, binding.organizationId);
    await assignOrganizationRole(userId);
    await clearOrganizationBinding(userId);

    return { organizationId: binding.organizationId };
  }

  @post('/organizations/binding-requests/{userId}/reject', {
    responses: BINDING_RESPONSE,
  })
  @requireRole(Role.ADMIN)
  async reject(
    @param.path.string('userId') userId: string,
  ): Promise<{ organizationId: number }> {
    const binding = await getOrganizationBinding(userId);
    if (binding?.status !== 'pending') {
      throw new HttpErrors.NotFound('No pending request for this user');
    }

    await rejectOrganizationBinding(userId);

    return { organizationId: binding.organizationId };
  }
}
