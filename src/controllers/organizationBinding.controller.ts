import {
  get,
  post,
  param,
  requestBody,
  HttpErrors,
  RestBindings,
} from '@loopback/rest';
import { inject } from '@loopback/context';
import { repository } from '@loopback/repository';
import { KeycloakRequest } from '../middleware/keycloakMiddleware';
import { requireRole } from '../interceptors/requireRole.interceptor';
import { Role } from '../types/roles';
import { OrganizationRepository } from '../repositories';
import { ORGANIZATION_BINDING_REQUEST_SCHEMA } from '../dto/organization-dto';
import {
  BindingRequest,
  OrganizationBinding,
  OrganizationBindingFields,
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
    @requestBody({
      required: false,
      content: {
        'application/json': {
          schema: ORGANIZATION_BINDING_REQUEST_SCHEMA,
        },
      },
    })
    proposed: OrganizationBindingFields = {},
  ): Promise<OrganizationBinding> {
    if (this.hasOrganization()) {
      throw new HttpErrors.Forbidden('User already belongs to an organization');
    }

    // Raises 404 when the organization does not exist.
    await this.organizationRepository.findById(id);

    return requestOrganizationBinding(this.currentUserId(), id, proposed);
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

    // Before the binding, so a failed write leaves the request pending.
    if (Object.keys(binding.proposed).length > 0) {
      const updated = await this.organizationRepository.updateOrganization(
        binding.organizationId,
        binding.proposed,
      );

      if (!updated) {
        throw new HttpErrors.NotFound(
          `Organization ${binding.organizationId} not found`,
        );
      }
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
