import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
  Filter,
  Options,
  Where,
  Count,
} from '@loopback/repository';
import { Planter, PlanterRelations, PlanterRegistration } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { PlanterRegistrationRepository } from './planterRegistration.repository';
import expect from 'expect-runtime';
import { buildFilterQuery } from '../js/buildFilterQuery';
import { utils } from '../js/utils';

export class PlanterRepository extends DefaultCrudRepository<
  Planter,
  typeof Planter.prototype.id,
  PlanterRelations
> {
  public readonly planterRegs: HasManyRepositoryFactory<
    PlanterRegistration,
    typeof Planter.prototype.id
  >;
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
    @repository.getter('PlanterRegistrationRepository')
    protected planterRegistrationRepositoryGetter: Getter<PlanterRegistrationRepository>,
  ) {
    super(Planter, dataSource);
    this.planterRegs = this.createHasManyRepositoryFactoryFor(
      'planterRegs',
      planterRegistrationRepositoryGetter,
    );
    this.registerInclusionResolver(
      'planterRegs',
      this.planterRegs.inclusionResolver,
    );
  }

  async getEntityIdsByOrganizationId(
    organizationId: number,
  ): Promise<Array<number>> {
    expect(organizationId).number();
    expect(this).property('execute').defined();
    const result = await this.execute(
      `select * from getEntityRelationshipChildren(${organizationId})`,
      [],
    );
    return result.map((e) => e.entity_id);
  }

  async getPlanterIdsByOrganizationId(
    organizationId: number,
  ): Promise<Array<number>> {
    expect(organizationId).number();
    const result = await this.execute(
      `select * from planter where organization_id in (select entity_id from getEntityRelationshipChildren(${organizationId}))`,
      [],
    );
    expect(result).match([{ id: expect.any(Number) }]);
    return result.map((e) => e.id);
  }

  async getNonOrganizationPlanterIds(): Promise<Array<number>> {
    const result = await this.execute(
      `select * from planter where organization_id isnull`,
      [],
    );
    expect(result).match([{ id: expect.any(Number) }]);
    return result.map((e) => e.id);
  }

  async getOrganizationWhereClause(organizationId: number): Promise<Object> {
    if (organizationId === null) {
      const planterIds = await this.getNonOrganizationPlanterIds();
      return {
        and: [{ organizationId: null }, { id: { inq: planterIds } }],
      };
    } else {
      const planterIds = await this.getPlanterIdsByOrganizationId(
        organizationId,
      );
      const entityIds = await this.getEntityIdsByOrganizationId(organizationId);

      return {
        or: [
          { organizationId: { inq: entityIds } },
          { id: { inq: planterIds } },
        ],
      };
    }
  }

  async applyOrganizationWhereClause(
    where: Object | undefined,
    organizationId: number | undefined,
  ): Promise<Object | undefined> {
    if (!where || organizationId === undefined) {
      return Promise.resolve(where);
    }
    const organizationWhereClause = await this.getOrganizationWhereClause(
      organizationId,
    );
    return {
      and: [where, organizationWhereClause],
    };
  }

  getPlanterRegistrationJoinClause(deviceIdentifier: string): string {
    if (deviceIdentifier === null) {
      return `LEFT JOIN planter_registrations
        ON planter.id=planter_registrations.planter_id
        WHERE (planter_registrations.device_identifier ISNULL)
        GROUP BY planter.id`;
    }
    return `JOIN planter_registrations
      ON planter.id=planter_registrations.planter_id
      WHERE (planter_registrations.device_identifier='${deviceIdentifier}')
      GROUP BY planter.id`;
  }

  // loopback .find() wasn't applying the org filters
  async findWithOrg(
    filter?: Filter<Planter>,
    deviceIdentifier?: string,
    options?: Options,
  ): Promise<(Planter & PlanterRelations)[]> {
    if (!filter || deviceIdentifier === null) {
      return await this.find(filter, options);
    }

    try {
      if (this.dataSource.connector) {
        const columnNames = this.dataSource.connector.buildColumnNames(
          'Planter',
          filter,
        );

        let selectStmt;
        if (deviceIdentifier) {
          selectStmt = `SELECT planter.* FROM planter ${this.getPlanterRegistrationJoinClause(
            deviceIdentifier,
          )}`;
        } else {
          selectStmt = `SELECT ${columnNames} FROM planter`;
        }

        const params = {
          filter,
          repo: this,
          modelName: 'Planter',
        };

        const query = buildFilterQuery(selectStmt, params);
        // console.log('query ---------', query);

        const result = await this.execute(query.sql, query.params, options);
        return <Planter[]>result.map((planter) => utils.convertCamel(planter));
      } else {
        throw 'Connector not defined';
      }
    } catch (e) {
      console.log(e);
      return await this.find(filter, options);
    }
  }

  async countWithOrg(
    where?: Where<Planter>,
    deviceIdentifier?: string,
    options?: Options,
  ): Promise<Count> {
    if (!where || deviceIdentifier === null) {
      return await this.count(where, options);
    }

    try {
      let selectStmt;
      if (deviceIdentifier) {
        selectStmt = `SELECT COUNT(*) FROM planter ${this.getPlanterRegistrationJoinClause(
          deviceIdentifier,
        )}`;
      } else {
        selectStmt = `SELECT COUNT(*) FROM planter`;
      }

      const params = {
        filter: { where },
        repo: this,
        modelName: 'Planter',
      };

      const query = buildFilterQuery(selectStmt, params);

      return <Promise<Count>>await this.execute(query.sql, query.params).then(
        (res) => {
          // responds with count value as a string
          return (res && res[0]) || { count: 0 };
        },
      );
    } catch (e) {
      console.log(e);
      return await this.count(where);
    }
  }
}
