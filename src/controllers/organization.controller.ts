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
    console.log(filter, filter ? filter.where : null);
    return await this.organizationRepository.find(filter);
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
