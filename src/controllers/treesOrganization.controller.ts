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
  HttpErrors,
} from '@loopback/rest';
import { Trees } from '../models';
import { TreesRepository } from '../repositories';

// Extend the LoopBack filter types for the Trees model to include tagId
// This is a workaround for the lack of proper join support in LoopBack
type TreesWhere =
  | (Where<Trees> & { tagId?: string; organizationId?: number })
  | undefined;
type TreesFilter = Filter<Trees> & { where: TreesWhere };

export class TreesOrganizationController {
  constructor(
    @repository(TreesRepository)
    public treesRepository: TreesRepository,
  ) {}

  @get('/organization/{organizationId}/trees/count', {
    responses: {
      '200': {
        description: 'Trees model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.path.number('organizationId') organizationId: number,
    @param.query.object('where', getWhereSchemaFor(Trees)) where?: TreesWhere,
  ): Promise<Count> {
    const tagId = where?.tagId;
    //override organization id if a sub-org id is in filter
    let orgId = organizationId.valueOf();

    if (where) {
      const { organizationId, ...whereWithoutOrganizationId } = where;
      const filterOrgId = organizationId;

      if (filterOrgId && filterOrgId !== orgId) {
        orgId = filterOrgId;
      }

      // Replace organizationId with full entity tree and planter query
      where = await this.treesRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        orgId,
      );
    }

    return await this.treesRepository.countWithTagId(where, tagId);
  }

  @get('/organization/{organizationId}/trees', {
    responses: {
      '200': {
        description: 'Array of Trees model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Trees } },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('organizationId') organizationId: number,
    @param.query.object('filter', getFilterSchemaFor(Trees))
    filter?: TreesFilter,
  ): Promise<Trees[]> {
    const tagId = filter?.where?.tagId;
    //override organization id if a sub-org id is in filter
    let orgId = organizationId.valueOf();

    if (filter?.where) {
      const { organizationId, ...whereWithoutOrganizationId } = filter.where;
      const filterOrgId = organizationId;

      if (filterOrgId && filterOrgId !== orgId) {
        orgId = filterOrgId;
      }

      // Replace organizationId with full entity tree and planter query
      filter.where = await this.treesRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        orgId,
      );
    }

    // console.log('treesOrganization filter ---', filter?.where);

    return await this.treesRepository.findWithTagId(filter, tagId);
  }

  @get('/organization/{organizationId}/trees/{id}', {
    responses: {
      '200': {
        description: 'Trees model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Trees } } },
      },
    },
  })
  async findById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('id') id: number,
  ): Promise<Trees> {
    const result = await this.treesRepository.findById(id, {
      include: [{ relation: 'treeTags' }],
    });

    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(
      organizationId,
    );
    const planterIds = await this.treesRepository.getPlanterIdsByOrganizationId(
      organizationId,
    );
    if (
      !entityIds.includes(result.plantingOrganizationId?.valueOf() || -1) &&
      !planterIds.includes(result.planterId?.valueOf() || -1)
    ) {
      throw new HttpErrors.Unauthorized(
        'Organizational user has no permission to do this operation',
      );
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
            schema: { type: 'array', items: { 'x-ts-type': Trees } },
          },
        },
      },
    },
  })
  async near(
    @param.query.number('lat') lat: number,
    @param.query.number('lon') lon: number,
    @param({
      name: 'radius',
      in: 'query',
      required: false,
      schema: { type: 'number' },
      description: 'measured in meters (default: 100 meters)',
    })
    radius: number,
    @param({
      name: 'limit',
      in: 'query',
      required: false,
      schema: { type: 'number' },
      description: 'default is 100',
    })
    limit: number,
  ): Promise<Trees[]> {
    const query = `SELECT * FROM Trees WHERE ST_DWithin(ST_MakePoint(lat,lon), ST_MakePoint(${lat}, ${lon}), ${
      radius ? radius : 100
    }, false) LIMIT ${limit ? limit : 100}`;
    console.log(`near query: ${query}`);
    return <Promise<Trees[]>>await this.treesRepository.execute(query, []);
  }

  @patch('/organization/{organizationId}/trees/{id}', {
    responses: {
      '204': {
        description: 'Trees PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('organizationId') organizationId: number,
    @param.path.number('id') id: number,
    @requestBody() trees: Trees,
  ): Promise<void> {
    const result = await this.treesRepository.findById(id);
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(
      organizationId,
    );
    const planterIds = await this.treesRepository.getPlanterIdsByOrganizationId(
      organizationId,
    );
    if (
      !entityIds.includes(result.plantingOrganizationId?.valueOf() || -1) &&
      !planterIds.includes(result.planterId?.valueOf() || -1)
    ) {
      throw new HttpErrors.Unauthorized(
        'Organizational user has no permission to do this operation',
      );
    }

    await this.treesRepository.updateById(id, trees);
  }
}
