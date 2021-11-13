import { Filter, repository } from '@loopback/repository';
import { param, get, getFilterSchemaFor } from '@loopback/rest';
import { PlanterRegistration } from '../models';
import { PlanterRegistrationRepository } from '../repositories';
import { buildFilterQuery } from '../js/buildFilterQuery.js';

export class PlanterRegistrationController {
  constructor(
    @repository(PlanterRegistrationRepository)
    public planterRepository: PlanterRegistrationRepository,
  ) {}

  @get('/planter-registration', {
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
  async find(
    @param.query.object('filter', getFilterSchemaFor(PlanterRegistration))
    filter?: Filter<PlanterRegistration>,
  ): Promise<PlanterRegistration[]> {
    // console.log('/planter-registration', filter ? filter.where : null);

    const sql = `SELECT planter_registrations.*, devices.manufacturer FROM planter_registrations
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
      repo: this.planterRepository,
      modelName: 'PlanterRegistration',
    };

    const query = buildFilterQuery(sql, params);

    return <Promise<PlanterRegistration[]>>(
      await this.planterRepository.execute(query.sql, query.params)
    );
  }

  @get('/planter-registration/{id}', {
    responses: {
      '200': {
        description: 'PlanterRegistration model instance',
        content: {
          'application/json': { schema: { 'x-ts-type': PlanterRegistration } },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
  ): Promise<PlanterRegistration> {
    return await this.planterRepository.findById(id);
  }
}
