import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Trees, TreeTag} from '../models';
import {TreesRepository} from '../repositories';

export class TreesTreeTagController {
  constructor(
    @repository(TreesRepository) protected treesRepository: TreesRepository,
  ) {}

  @get('/trees/{id}/tree_tags', {
    responses: {
      '200': {
        description: 'Array of Trees has many TreeTag',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TreeTag)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: Number,
    @param.query.object('filter') filter?: Filter<TreeTag>,
  ): Promise<TreeTag[]> {
    return this.treesRepository.treeTags(id).find(filter);
  }

  @post('/trees/{id}/tree_tags', {
    responses: {
      '200': {
        description: 'Trees model instance',
        content: {'application/json': {schema: getModelSchemaRef(TreeTag)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Trees.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TreeTag, {
            title: 'NewTreeTagInTrees',
            exclude: ['id'],
            optional: ['treeId'],
          }),
        },
      },
    })
    treeTag: Omit<TreeTag, 'id'>,
  ): Promise<TreeTag> {
    return this.treesRepository.treeTags(id).create(treeTag);
  }

  @patch('/trees/{id}/tree_tags', {
    responses: {
      '200': {
        description: 'Trees.TreeTag PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: Number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TreeTag, {partial: true}),
        },
      },
    })
    treeTag: Partial<TreeTag>,
    @param.query.object('where', getWhereSchemaFor(TreeTag))
    where?: Where<TreeTag>,
  ): Promise<Count> {
    return this.treesRepository.treeTags(id).patch(treeTag, where);
  }

  @del('/trees/{id}/tree_tags', {
    responses: {
      '200': {
        description: 'Trees.TreeTag DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: Number,
    @param.query.object('where', getWhereSchemaFor(TreeTag))
    where?: Where<TreeTag>,
  ): Promise<Count> {
    return this.treesRepository.treeTags(id).delete(where);
  }
}
