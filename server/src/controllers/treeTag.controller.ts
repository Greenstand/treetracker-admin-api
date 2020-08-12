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
import {TreeTag} from '../models';
import {TreeTagRepository} from '../repositories';

export class TreeTagController {
  constructor(
    @repository(TreeTagRepository)
    public treeTagRepository : TreeTagRepository,
  ) {}

  @get('/tree_tags/count', {
    responses: {
      '200': {
        description: 'TreeTag model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(TreeTag)) where?: Where<TreeTag>,
  ): Promise<Count> {
    return await this.treeTagRepository.count(where);
  }

  @get('/tree_tags', {
    responses: {
      '200': {
        description: 'Array of TreeTag model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': TreeTag}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(TreeTag)) filter?: Filter<TreeTag>,
  ): Promise<TreeTag[]> {
    console.log(filter, filter?filter.where:null);
    return await this.treeTagRepository.find(filter);
  }

  @get('/tree_tags/{id}', {
    responses: {
      '200': {
        description: 'TreeTag model instance',
        content: {'application/json': {schema: {'x-ts-type': TreeTag}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<TreeTag> {
    return await this.treeTagRepository.findById(id);
  }

  @patch('/tree_tags/{id}', {
    responses: {
      '204': {
        description: 'TreeTag PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() tag: TreeTag,
  ): Promise<void> {
    await this.treeTagRepository.updateById(id, tag);
  }

  @post('/tree_tags/', {
    responses: {
      '204': {
        description: 'TreeTag POST success',
      },
    },
  })
  async create(
    @requestBody() treeTag: TreeTag,
  ): Promise<TreeTag> {
    // Only create the tree tag if it doesn't already exist
    const match = await this.treeTagRepository.findOne({where:{tagId: treeTag.tagId, treeId: treeTag.treeId}});
    if (match) {
      return match;
    }
    return await this.treeTagRepository.create(treeTag);
  }

  @del('/tree_tags/{id}', {
    responses: {
      '204': {
        description: 'TreeTag delete success',
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
  ): Promise<void>{
    await this.treeTagRepository.deleteById(id)
  }

}
