import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
} from '@loopback/rest';
import { Organization } from '../models';
import { OrganizationRepository } from '../repositories';

// Extend the LoopBack filter types for the Planter model to include type
type OrganizationWhere = (Where<Organization> & { type?: string }) | undefined;
export type OrganizationFilter = Filter<Organization> & {
  where: OrganizationWhere;
};
export class OrganizationController {
  constructor(
    @repository(OrganizationRepository)
    public organizationRepository: OrganizationRepository,
  ) {}

  @get('/organizations/count', {
    responses: {
      '200': {
        description: 'Organization model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Organization))
    where?: Where<Organization>,
  ): Promise<Count> {
    return await this.organizationRepository.count(where);
  }

  @get('/organizations', {
    responses: {
      '200': {
        description: 'Array of Organization model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Organization } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Organization))
    filter?: Filter<Organization>,
  ): Promise<Organization[]> {
    return await this.organizationRepository.find(filter);
  }

  @get('/organization/{organizationId}/organizations', {
    responses: {
      '200': {
        description: 'Array of Organization model instances by Org',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Organization } },
          },
        },
      },
    },
  })
  async findByParentOrg(
    @param.path.number('organizationId') organizationId: Number,
    @param.query.object('filter', getFilterSchemaFor(Organization))
    filter?: OrganizationFilter,
  ): Promise<Organization[]> {
    // if logged in as an org-account then filter for the sub-orgs
    if (organizationId && filter?.where) {
      filter.where = { ...filter.where, type: 'o' };
    }

    // create query to get all orgs and their planters
    if (filter?.where) {
      filter.where = await this.organizationRepository.applyOrganizationWhereClause(
        filter.where,
        organizationId.valueOf(),
      );
    }

    const childOrgs = await this.organizationRepository.find(filter);

    return childOrgs;
  }

  @get('/organizations/{id}', {
    responses: {
      '200': {
        description: 'Organization model instance',
        content: {
          'application/json': { schema: { 'x-ts-type': Organization } },
        },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Organization> {
    return await this.organizationRepository.findById(id);
  }
}
