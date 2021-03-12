import { Filter, repository, Where } from '@loopback/repository';
import { ParameterizedSQL } from 'loopback-connector';
import { param, get, getFilterSchemaFor } from '@loopback/rest';
import { Planter, PlanterRegistration } from '../models';
import { PlanterRegistrationRepository } from '../repositories';

// Extend the LoopBack filter types for the Trees model to include tagId
// This is a workaround for the lack of proper join support in LoopBack
type PlanterRegistrationWhere = Where<PlanterRegistration> & {
  planterId?: number;
};
type PlanterRegistrationFilter = Filter<PlanterRegistration> & {
  where: PlanterRegistrationWhere;
};

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
    filter?: PlanterRegistrationFilter,
  ): Promise<PlanterRegistration[]> {
    const query = this.buildFilterQuery(
      `SELECT * FROM planter_registrations`,
      `LEFT JOIN (
        SELECT region.name AS country, region.geom FROM region, region_type
        WHERE region_type.type='country' AND region.type_id=region_type.id
    ) AS region ON ST_DWithin(region.geom, planter_registrations.geom, 0.01)`,
      '',
      filter?.where,
    );

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

  private getConnector() {
    return this.planterRepository.dataSource.connector;
  }

  private buildFilterQuery(
    selectClause: string,
    joinClause?: string,
    whereClause?: string,
    whereObj?: PlanterRegistrationWhere,
  ) {
    let sql = selectClause;
    if (joinClause) {
      sql += ` ${joinClause}`;
    }

    if (whereClause) {
      sql += ` ${whereClause}`;
    }

    let query = new ParameterizedSQL(sql);

    if (whereObj) {
      const connector = this.getConnector();
      if (connector) {
        const model = connector._models.PlanterRegistration.model;

        if (model) {
          let safeWhere = model._sanitizeQuery(whereObj);
          safeWhere = model._coerce(safeWhere);

          const whereObjClause = connector._buildWhere(
            'PlanterRegistration',
            safeWhere,
          );
          console.log(whereObjClause);
          if (whereObjClause && whereObjClause.sql) {
            query.sql += ` ${whereClause ? 'AND' : 'WHERE'} ${
              whereObjClause.sql
            }`;
            query.params = whereObjClause.params;
          }

          query = connector.parameterize(query);
        }
      }
    }

    return query;
  }
}
