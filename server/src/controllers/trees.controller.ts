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
} from '@loopback/rest';
import {Trees} from '../models';
import {TreesRepository} from '../repositories';

export class TreesController {
  constructor(
    @repository(TreesRepository)
    public treesRepository : TreesRepository,
  ) {}

  @get('/trees/count', {
    responses: {
      '200': {
        description: 'Trees model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Trees)) where?: Where<Trees>,
  ): Promise<Count> {
    return await this.treesRepository.count(where);
  }

  @get('/trees', {
    responses: {
      '200': {
        description: 'Array of Trees model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Trees}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Trees)) filter?: Filter<Trees>,
  ): Promise<Trees[]> {
    return await this.treesRepository.find(filter);
  }

  @get('/trees/{id}', {
    responses: {
      '200': {
        description: 'Trees model instance',
        content: {'application/json': {schema: {'x-ts-type': Trees}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Trees> {
    return await this.treesRepository.findById(id);
  }

  @patch('/trees/{id}', {
    responses: {
      '204': {
        description: 'Trees PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() trees: Trees,
  ): Promise<void> {
    await this.treesRepository.updateById(id, trees);
  }

}
