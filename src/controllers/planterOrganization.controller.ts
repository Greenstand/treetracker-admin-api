import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
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

// Extend the LoopBack filter types for the Planter model to include organizationId
// This is a workaround for the lack of proper join support in LoopBack
type PlanterWhere = (Where<Planter> & { organizationId?: number }) | undefined;
export type PlanterFilter = Filter<Planter> & { where: PlanterWhere };
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
    where?: PlanterWhere,
  ): Promise<Count> {
    //override organization id if a sub-org id is in filter AND it matches one of the organization's entityIds
    let orgId = organizationId.valueOf();

    if (where) {
      const { organizationId, ...whereWithoutOrganizationId } = where;
      const filterOrgId = organizationId;

      if (filterOrgId && filterOrgId !== orgId) {
        const entityIds =
          await this.planterRepository.getEntityIdsByOrganizationId(orgId);
        orgId = entityIds.includes(filterOrgId) ? filterOrgId : orgId;
      }

      // Replace organizationId with full entity tree and planter query
      where = await this.planterRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        orgId,
      );
    }

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
    filter?: PlanterFilter,
  ): Promise<Planter[]> {
    //override organization id if a sub-org id is in filter AND it matches one of the organization's entityIds
    let orgId = organizationId.valueOf();

    if (filter?.where) {
      const { organizationId, ...whereWithoutOrganizationId } = filter.where;
      const filterOrgId = organizationId;

      if (filterOrgId && filterOrgId !== orgId) {
        const entityIds =
          await this.planterRepository.getEntityIdsByOrganizationId(orgId);
        orgId = entityIds.includes(filterOrgId) ? filterOrgId : orgId;
      }

      // Replace organizationId with full entity tree and planter query
      filter.where = await this.planterRepository.applyOrganizationWhereClause(
        whereWithoutOrganizationId,
        orgId,
      );
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
    const sql = `SELECT *, devices.manufacturer FROM planter_registrations
        JOIN devices ON devices.android_id=planter_registrations.device_identifier
        LEFT JOIN (
          SELECT
            region.name AS country,
            region.geom FROM region, region_type
          WHERE region_type.type='country'
          AND region.type_id=region_type.id
        ) AS region
        ON ST_DWithin(region.geom, planter_registrations.geom, 0.01)`;

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
    filter = {
      where: { planterId: id, planterPhotoUrl: { neq: null } },
      ...filter,
    };
    return await this.treesRepository.find(filter);
  }
}
