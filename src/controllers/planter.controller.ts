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
    where?: Where<Planter>,
  ): Promise<Count> {
    return await this.planterRepository.count(where);
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
    filter?: Filter<Planter>,
  ): Promise<Planter[]> {
    return await this.planterRepository.find(filter);
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
