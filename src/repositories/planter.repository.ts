import {
  DefaultCrudRepository,
  Filter,
  Where,
  Count,
} from '@loopback/repository';
import { Planter, PlanterRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';
import expect from 'expect-runtime';
import { buildFilterQuery } from '../js/buildFilterQuery';
import { utils } from '../js/utils';

export class PlanterRepository extends DefaultCrudRepository<
  Planter,
  typeof Planter.prototype.id,
  PlanterRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(Planter, dataSource);
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

  // loopback .find() wasn't applying the org filters
  async findWithOrg(
    filter?: Filter<Planter>,
  ): Promise<(Planter & PlanterRelations)[]> {
    if (!filter) {
      return await this.find(filter);
    }

    try {
      if (this.dataSource.connector) {
        const columnNames = this.dataSource.connector.buildColumnNames(
          'Planter',
          filter,
        );

        const selectStmt = `SELECT ${columnNames} FROM planter `;

        const params = {
          filter,
          repo: this,
          modelName: 'Planter',
        };

        const query = buildFilterQuery(selectStmt, params);

        const result = await this.execute(query.sql, query.params);
        return <Planter[]>result.map((planter) => utils.convertCamel(planter));
      } else {
        throw 'Connector not defined';
      }
    } catch (e) {
      console.log(e);
      return await this.find(filter);
    }
  }

  async countWithOrg(where?: Where<Planter>): Promise<Count> {
    if (!where) {
      return await this.count(where);
    }

    try {
      const selectStmt = `SELECT COUNT(*) FROM planter `;

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
