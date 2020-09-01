import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {Planter} from '../models';
import {PlanterRepository, TreesRepository} from '../repositories';
const expect : any = require("expect-runtime");

export class PlanterOrganizationController {
  constructor(
    @repository(PlanterRepository)
    public planterRepository : PlanterRepository,
    @repository(TreesRepository)
    public treesRepository : TreesRepository,
  ) {}

  @get('/organization/{organizationId}/planter/count', {
    responses: {
      '200': {
        description: 'Planter model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.path.number('organizationId') organizationId: number,
    @param.query.object('where', getWhereSchemaFor(Planter)) where?: Where<Planter>,
  ): Promise<Count> {
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(organizationId);
    where = {
      ...where,
      organizationId : {
        inq: entityIds,
      }
    }
    return await this.planterRepository.count(where);
  }

  @get('/organization/{organizationId}/planter', {
    responses: {
      '200': {
        description: 'Array of Planter model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Planter}},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('organizationId') organizationId: number,
    @param.query.object('filter', getFilterSchemaFor(Planter)) filter?: Filter<Planter>,
  ): Promise<Planter[]> {
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(organizationId);
    if(filter){
      //filter should be to deal with the organization, but here is just for 
      //demonstration
      filter.where = {
        ...filter.where,
        organizationId: {
          inq: entityIds,
        },
      }
    }
    return await this.planterRepository.find(filter);
  }

  @get('/organization/{organizationId}/planter/{id}', {
    responses: {
      '200': {
        description: 'Planter model instance',
        content: {'application/json': {schema: {'x-ts-type': Planter}}},
      },
    },
  })
  async findById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('id') id: number
  ): Promise<Planter> {
    const result = await this.planterRepository.findById(id);
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(organizationId);
    if(!entityIds.includes(result.organizationId || -1)){
      throw new HttpErrors.Unauthorized('Organizational user has no permission to do this operation');
    }
    return await this.planterRepository.findById(id);
  }

  @patch('/organization/{organizationId}/planter/{id}', {
    responses: {
      '204': {
        description: 'Planter PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('id') id: number,
    @requestBody() planter: Planter,
  ): Promise<void> {
      throw new HttpErrors.Unauthorized('Organizational user has no permission to do this operation');
    const result = await this.planterRepository.findById(id);
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(organizationId);
    if(!entityIds.includes(result.organizationId || -1)){
      throw new HttpErrors.Unauthorized('Organizational user has no permission to do this operation');
    }
    await this.planterRepository.updateById(id, planter);
  }

}
