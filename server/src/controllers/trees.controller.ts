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
    console.log(filter, filter?filter.where:null);
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

  // this route is for finding trees within a radius of a lat/lon point
  // issues:
  // - i'd rather have this as part of api to just /trees, maybe if you add it in the where clause?
  // - i'd rather have the default values show up in the api, but when I tried putting the default after : it failed
  // - is it better to have the params as a single object or is it fine to have them separate as they are now?
  // - could/should i just reuse the filter object for the limit? fyi, it was really slow without a limit
  // - how do i add documentation to the radius param to say it is in meters?
  @get('/trees/near', {
    responses: {
      '200': {
        description: 'Find trees near a lat/lon with a radius in meters',
        content: {
        'application/json': {
          schema: {type: 'array', items: {'x-ts-type': Trees}},
        },
        },
      },
    },
  })
  async near(@param.query.number('lat') lat :number, 
             @param.query.number('lon') lon :number,
             @param.query.number('radius') radius? :number,
             @param.query.number('limit') limit? :number) : Promise<Trees[]> {
    let query = `SELECT * FROM Trees WHERE ST_DWithin(ST_MakePoint(lat,lon), ST_MakePoint(${lat}, ${lon}), ${radius?radius:100}) LIMIT ${limit?limit:null}`;
    console.log(`near query: ${query}`);
    return <Promise<Trees[]>> await this.treesRepository.execute(query, []);
    //return <Promise<Trees[]>> await this.treesRepository.execute("SELECT lat,lon FROM Trees WHERE ST_DWithin(ST_MakePoint(lat,lon), ST_MakePoint(-3.269201666666667, 36.62356166666667), 100)", [])
  }
  // execute commands for postgress seen here: https://github.com/strongloop/loopback-connector-postgresql/blob/master/lib/postgresql.js
  
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
