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
  // put,
  del,
  requestBody,
} from '@loopback/rest';
import { Species } from '../models';
import { SpeciesRepository, TreesRepository } from '../repositories';

export class SpeciesController {
  constructor(
    @repository(SpeciesRepository)
    public speciesRepository: SpeciesRepository,
    @repository(TreesRepository)
    public treesRepository: TreesRepository,
  ) {}

  @get('/species/count', {
    responses: {
      '200': {
        description: 'Species model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Species))
    where?: Where<Species>,
  ): Promise<Count> {
    // Only include active species
    where = { ...where, active: true };
    return await this.speciesRepository.count(where);
  }

  @get('/species', {
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
  async find(
    @param.query.object('filter', getFilterSchemaFor(Species))
    filter?: Filter<Species>,
  ): Promise<Species[]> {
    console.log('get /species filter --> ', filter ? filter.where : null);
    // Only include active species
    filter = { ...filter, where: { ...filter?.where, active: true } };
    return await this.speciesRepository.find(filter);
  }

  @get('/species/{id}', {
    responses: {
      '200': {
        description: 'Species model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Species } } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Species> {
    return await this.speciesRepository.findById(id);
  }

  @patch('/species/{id}', {
    responses: {
      '204': {
        description: 'Species PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() species: Species,
  ): Promise<void> {
    await this.speciesRepository.updateById(id, species);
  }

  @post('/species/combine', {
    responses: {
      '204': {
        description: 'Species POST success',
      },
    },
  })
  async combine(
    @requestBody() request: { combine: number[]; species: Species },
  ): Promise<void> {
    const newSpecies = await this.speciesRepository.create(request.species);

    const updateQuery = `UPDATE trees SET species_id=${
      newSpecies.id
    } WHERE species_id IN (${request.combine.join(', ')})`;

    const deleteQuery = `UPDATE tree_species SET active=false WHERE id IN (${request.combine.join(
      ', ',
    )})`;

    await this.treesRepository.execute(updateQuery, []);
    await this.speciesRepository.execute(deleteQuery, []);
  }

  @post('/species/', {
    responses: {
      '204': {
        description: 'Species POST success',
      },
    },
  })
  async create(@requestBody() species: Species): Promise<Species> {
    return await this.speciesRepository.create(species);
  }

  @del('/species/{id}', {
    responses: {
      '204': {
        description: 'Species delete success',
      },
    },
  })
  async delete(@param.path.number('id') id: number): Promise<void> {
    const deleteQuery = `UPDATE tree_species SET active=false WHERE id=${id}`;
    await this.speciesRepository.execute(deleteQuery, []);
  }
}
