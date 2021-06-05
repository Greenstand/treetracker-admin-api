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
import { buildFilterQuery } from '../js/buildFilterQuery.js';
import { Planter, Trees, PlanterRegistration } from '../models';
import { TreesFilter } from './trees.controller';
import {
  PlanterRepository,
  TreesRepository,
  PlanterRegistrationRepository,
} from '../repositories';
// import expect from "expect-runtime";

export class PlanterOrganizationController {
  constructor(
    @repository(PlanterRepository)
    public planterRepository: PlanterRepository,
    @repository(TreesRepository)
    public treesRepository: TreesRepository,
    @repository(PlanterRegistrationRepository)
    public planterRegistrationRepository: PlanterRegistrationRepository,
  ) {}

  @get('/organization/{organizationId}/planter/count', {
    responses: {
      '200': {
        description: 'Planter model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.path.number('organizationId') organizationId: Number,
    @param.query.object('where', getWhereSchemaFor(Planter))
    where?: Where<Planter>,
  ): Promise<Count> {
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(
      organizationId.valueOf(),
    );
    where = {
      ...where,
      organizationId: {
        inq: entityIds,
      },
    };
    return await this.planterRepository.count(where);
  }

  @get('/organization/{organizationId}/planter', {
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
    @param.path.number('organizationId') organizationId: Number,
    @param.query.object('filter', getFilterSchemaFor(Planter))
    filter?: Filter<Planter>,
  ): Promise<Planter[]> {
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(
      organizationId?.valueOf() || -1,
    );
    if (filter) {
      //filter should be to deal with the organization, but here is just for
      //demonstration
      filter.where = {
        ...filter.where,
        organizationId: {
          inq: entityIds,
        },
      };
    }
    return await this.planterRepository.find(filter);
  }

  @get('/organization/{organizationId}/planter-registration', {
    responses: {
      '200': {
        description: 'Array of PlanterRegistration model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { 'x-ts-type': PlanterRegistration },
            },
          },
        },
      },
    },
  })
  async findPlanterRegistration(
    @param.query.object('filter', getFilterSchemaFor(PlanterRegistration))
    filter?: Filter<PlanterRegistration>,
  ): Promise<PlanterRegistration[]> {
    // console.log('/organization/{organizationId}/planter-registration');

    const sql = `SELECT * FROM planter_registrations
        LEFT JOIN (
        SELECT region.name AS country, region.geom FROM region, region_type
        WHERE region_type.type='country' AND region.type_id=region_type.id
    ) AS region ON ST_DWithin(region.geom, planter_registrations.geom, 0.01)`;

    const params = {
      filter,
      repo: this.planterRegistrationRepository,
      modelName: 'PlanterRegistration',
    };

    const query = buildFilterQuery(sql, params);

    return <Promise<PlanterRegistration[]>>(
      await this.planterRegistrationRepository.execute(query.sql, query.params)
    );
  }

  @get('/organization/{organizationId}/planter/{id}', {
    responses: {
      '200': {
        description: 'Planter model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Planter } } },
      },
    },
  })
  async findById(
    @param.path.number('organizationId') organizationId: Number,
    @param.path.number('id') id: Number,
  ): Promise<Planter> {
    const result = await this.planterRepository.findById(id);
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(
      organizationId.valueOf(),
    );
    if (!entityIds.includes(result?.organizationId?.valueOf() || -1)) {
      throw new HttpErrors.Unauthorized(
        'Organizational user has no permission to do this operation',
      );
    }
    return result;
  }

  @patch('/organization/{organizationId}/planter/{id}', {
    responses: {
      '204': {
        description: 'Planter PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('organizationId') organizationId: Number,
    @param.path.number('id') id: Number,
    @requestBody() planter: Planter,
  ): Promise<void> {
    const result = await this.planterRepository.findById(id);
    const entityIds = await this.treesRepository.getEntityIdsByOrganizationId(
      organizationId.valueOf(),
    );
    if (!entityIds.includes(result?.organizationId?.valueOf() || -1)) {
      throw new HttpErrors.Unauthorized(
        'Organizational user has no permission to do this operation',
      );
    }
    await this.planterRepository.updateById(id, planter);
  }

  @get('/organization/{organizationId}/planter/{id}/selfies', {
    responses: {
      '200': {
        description: 'Array of Trees model instances',
        content: { 'application/json': { schema: { 'x-ts-type': Trees } } },
      },
    },
  })
  // NOTE: Selfies are saved on the Trees Table
  async findSelfiesById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Trees))
    filter?: TreesFilter,
  ): Promise<Trees[]> {
    // console.log('/organization/{organizationId}/planter/{id}/selfies', id, filter);
    filter = {
      where: { planterId: id, planterPhotoUrl: { neq: null } },
      ...filter,
    };
    return await this.treesRepository.find(filter);
  }
}
