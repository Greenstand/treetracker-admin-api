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
import {Trees} from '../models';
import {TreesRepository} from '../repositories';

export class TreesOrganizationController {
  constructor(
    @repository(TreesRepository)
    public treesRepository : TreesRepository,
  ) {}

  @get('/organization/{oganizationId}/trees/count', {
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

  @get('/organization/{organizationId}/trees', {
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
    @param.path.number('organizationId') organizationId: number,
    @param.query.object('filter', getFilterSchemaFor(Trees)) filter?: Filter<Trees>,
  ): Promise<Trees[]> {
    if(filter){
      //filter should be to deal with the organization, but here is just for 
      //demonstration
      filter.where = {
        deviceId: organizationId,
      }
    }
    console.log("filter:", filter, filter?filter.where:null);
    return await this.treesRepository.find(filter);
  }

  @get('/organization/{organizationId}/trees/{id}', {
    responses: {
      '200': {
        description: 'Trees model instance',
        content: {'application/json': {schema: {'x-ts-type': Trees}}},
      },
    },
  })
  async findById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('id') id: number
  ): Promise<Trees> {
    const result = await this.treesRepository.findById(id);
    if(result.deviceId !== organizationId){
      throw new HttpErrors.Unauthorized('Organizational user has no permission to do this operation');
    }
    return result;
  }

  // this route is for finding trees within a radius of a lat/lon point
  // execute commands for postgress seen here: https://github.com/strongloop/loopback-connector-postgresql/blob/master/lib/postgresql.js
  @get('/organization/{organizationId}/trees/near', {
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
             @param({
              name: 'radius',
              in: 'query',
              required: false,
              schema: {type: 'number'},
              description: 'measured in meters (default: 100 meters)'
             }) radius :number,
             @param({
              name: 'limit',
              in: 'query',
              required: false,
              schema: {type: 'number'},
              description: 'default is 100'
             }) limit :number,
             ) : Promise<Trees[]> {
    let query = `SELECT * FROM Trees WHERE ST_DWithin(ST_MakePoint(lat,lon), ST_MakePoint(${lat}, ${lon}), ${radius?radius:100}, false) LIMIT ${limit?limit:100}`;
    console.log(`near query: ${query}`);
    return <Promise<Trees[]>> await this.treesRepository.execute(query, []);
  }
  
  @patch('/organization/{organizationId}/trees/{id}', {
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
