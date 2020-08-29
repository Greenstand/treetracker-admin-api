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
import { Tag } from '../models';
import { TagRepository } from '../repositories';

export class TagController {
  constructor(
    @repository(TagRepository)
    public tagRepository: TagRepository,
  ) {}

  @get('/tags/count', {
    responses: {
      '200': {
        description: 'Tag model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Tag)) where?: Where<Tag>,
  ): Promise<Count> {
    return await this.tagRepository.count(where);
  }

  @get('/tags', {
    responses: {
      '200': {
        description: 'Array of Tag model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Tag } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Tag)) filter?: Filter<Tag>,
  ): Promise<Tag[]> {
    console.log(filter, filter ? filter.where : null);
    return await this.tagRepository.find(filter);
  }

  @get('/tags/{id}', {
    responses: {
      '200': {
        description: 'Tag model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Tag } } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Tag> {
    return await this.tagRepository.findById(id);
  }

  @patch('/tags/{id}', {
    responses: {
      '204': {
        description: 'Tag PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() tag: Tag,
  ): Promise<void> {
    await this.tagRepository.updateById(id, tag);
  }

  @post('/tags', {
    responses: {
      '204': {
        description: 'Tag POST success',
      },
    },
  })
  async create(@requestBody() tag: Tag): Promise<Tag> {
    // Only create the tag if it doesn't already exist
    const match = await this.tagRepository.findOne({
      where: { tagName: { ilike: tag.tagName } },
    });
    if (match) {
      return match;
    }
    return await this.tagRepository.create(tag);
  }

  @del('/tags/{id}', {
    responses: {
      '204': {
        description: 'Tag delete success',
      },
    },
  })
  async delete(@param.path.number('id') id: number): Promise<void> {
    await this.tagRepository.deleteById(id);
  }
}
