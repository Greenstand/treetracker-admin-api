import { inject } from '@loopback/context';
import { repository, Filter } from '@loopback/repository';
import {
  Request,
  RestBindings,
  get,
  post,
  param,
  getFilterSchemaFor,
  HttpErrors,
} from '@loopback/rest';
import {
  OrganizationSpeciesRepository,
  SpeciesRepository,
} from '../repositories';
import { Species, OrganizationSpecies } from '../models';
const WRITE_ALLOWED_POLICIES = ['super_permission', 'manage_org_species'];

export class OrganizationSpeciesController {
  constructor(
    @repository(OrganizationSpeciesRepository)
    public organizationSpeciesRepository: OrganizationSpeciesRepository,
    @repository(SpeciesRepository)
    public speciesRepository: SpeciesRepository,
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
  ) {}

  @get('/organization/{organizationId}/species', {
    responses: {
      '200': {
        description: 'Array of Species model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Species } },
          },
        },
      },
    },
  })
  async findScopedSpecies(
    @param.path.number('organizationId') organizationId: number,
    @param.query.object('filter', getFilterSchemaFor(Species))
    filter?: Filter<Species>,
  ): Promise<Species[]> {
    const links = await this.organizationSpeciesRepository.find({
      where: { organizationId, isActive: true },
    });
    const speciesIds = links.map((link) => link.speciesId);
    if (speciesIds.length === 0) {
      return [];
    }
    return await this.speciesRepository.find({
      where: { id: { inq: speciesIds }, active: true },
      order: filter?.order ?? ['name ASC'],
    });
  }
  // Activate
  @post('/organization/{organizationId}/species/{speciesId}/activate', {
    responses: {
      '200': {
        description: 'Activate a species for an organization',
        content: {
          'application/json': { schema: { 'x-ts-type': OrganizationSpecies } },
        },
      },
    },
  })
  async activate(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('speciesId') speciesId: number,
  ): Promise<OrganizationSpecies> {
    this.assertWriteAllowed();
    // Catalog check - refuse with 422
    const species = await this.speciesRepository.findOne({
      where: { id: speciesId },
    });
    if (!species || !species.active) {
      throw new HttpErrors.UnprocessableEntity('species is not active');
    }
    const existing = await this.organizationSpeciesRepository.findOne({
      where: { organizationId, speciesId },
    });
    // Write into the table
    if (existing) {
      const now = new Date();
      await this.organizationSpeciesRepository.updateById(existing.id, {
        isActive: true,
        timeUpdated: now,
      });
      existing.isActive = true;
      existing.timeUpdated = now;
      return existing;
    }
    return await this.organizationSpeciesRepository.create({
      organizationId,
      speciesId,
      isActive: true,
      timeCreated: new Date(),
      timeUpdated: new Date(),
    });
  }
  // Deactivate
  @post('/organization/{organizationId}/species/{speciesId}/deactivate', {
    responses: {
      '204': {
        description: 'Deactivate a species for an organization',
      },
    },
  })
  async deactivate(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('speciesId') speciesId: number,
  ): Promise<void> {
    this.assertWriteAllowed();
    const existing = await this.organizationSpeciesRepository.findOne({
      where: { organizationId, speciesId },
    });
    if (existing) {
      await this.organizationSpeciesRepository.updateById(existing.id, {
        isActive: false,
        timeUpdated: new Date(),
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestHasUser(request: Request): request is Request & { user: any } {
    return 'user' in request;
  }

  private assertWriteAllowed(): void {
    let isAllowed = false;
    if (this.requestHasUser(this.request)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userPolicies: any[] = this.request.user.policy.policies;
      isAllowed = userPolicies.some((userPolicy) =>
        WRITE_ALLOWED_POLICIES.some(
          (allowedPolicy) => allowedPolicy === userPolicy.name,
        ),
      );
    }
    if (!isAllowed) {
      throw new HttpErrors.Unauthorized('No permission');
    }
  }
}
