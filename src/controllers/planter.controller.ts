import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  // post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  // put,
  // del,
  requestBody,
} from '@loopback/rest';
import { Planter, Trees } from '../models';
import { TreesFilter } from './trees.controller';
import { PlanterRepository, TreesRepository } from '../repositories';

// Extend the LoopBack filter types for the Planter model to include organizationId
type PlanterWhere = (Where<Planter> & { organizationId?: number }) | undefined;
export type PlanterFilter = Filter<Planter> & { where: PlanterWhere };

export class PlanterController {
  constructor(
    @repository(PlanterRepository)
    public planterRepository: PlanterRepository,
    @repository(TreesRepository)
    public treesRepository: TreesRepository,
  ) {}

  @get('/planter/count', {
    responses: {
      '200': {
        description: 'Planter model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Planter))
    where?: PlanterWhere,
  ): Promise<Count> {
    // Replace organizationId with full entity tree and planter
    if (where) {
      const { organizationId, ...whereWithoutOrganizationId } = where;
      where = await this.planterRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        organizationId,
      );
    }
    // console.log('get /planter/count where -->', where);

    return await this.planterRepository.countWithOrg(where);
  }

  @get('/planter', {
    responses: {
      '200': {
        description: 'Array of Planter model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Planter } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Planter))
    filter?: PlanterFilter,
  ): Promise<Planter[]> {
    // Replace organizationId with full entity tree and planter
    if (filter?.where) {
      const { organizationId, ...whereWithoutOrganizationId } = filter.where;
      filter.where = await this.planterRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        organizationId,
      );
    }

    return await this.planterRepository.findWithOrg(filter);
  }

  @get('/planter/{id}', {
    responses: {
      '200': {
        description: 'Planter model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Planter } } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Planter> {
    return await this.planterRepository.findById(id);
  }

  @get('/planter/{id}/selfies', {
    responses: {
      '200': {
        description: 'Array of Trees model instances',
        content: { 'application/json': { schema: { 'x-ts-type': Trees } } },
      },
    },
  })
  async findSelfiesById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Trees))
    filter?: TreesFilter,
  ): Promise<Trees[]> {
    // console.log('/planter/{id}/selfies', id, filter);
    filter = {
      where: { planterId: id, planterPhotoUrl: { neq: null } },
      ...filter,
    };
    return await this.treesRepository.find(filter);
  }

  @patch('/planter/{id}', {
    responses: {
      '204': {
        description: 'Planter PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() planter: Planter,
  ): Promise<void> {
    await this.planterRepository.updateById(id, planter);
  }
}
