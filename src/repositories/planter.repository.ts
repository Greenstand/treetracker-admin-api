import { Constructor, inject, Getter } from '@loopback/core';
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
import { PlanterRegistrationRepository } from './planterRegistration.repository';
import { UtilsRepositoryMixin } from '../mixins/utils.repository-mixin';
import expect from 'expect-runtime';
import { buildFilterQuery } from '../js/buildFilterQuery';
import { utils } from '../js/utils';

export class PlanterRepository extends UtilsRepositoryMixin<
  Planter,
  Constructor<
    DefaultCrudRepository<
      Planter,
      typeof Planter.prototype.id,
      PlanterRelations
    >
  >
>(DefaultCrudRepository) {
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

  getPlanterRegistrationJoinClause(deviceIdentifier: string): string {
    if (deviceIdentifier === null) {
      return `LEFT JOIN planter_registrations
        ON planter.id=planter_registrations.planter_id
        WHERE (planter_registrations.device_identifier ISNULL)`;
    }
    return `JOIN planter_registrations
      ON planter.id=planter_registrations.planter_id
      WHERE (planter_registrations.device_identifier='${deviceIdentifier}')`;
  }

  // default .find() wasn't applying the org filters

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
        const columnNames = this.dataSource.connector
          .buildColumnNames('Planter', filter)
          .replace('"id"', 'planter.id as "id"');

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
          return (res && res[0]) || { count: 0 };
        },
      );
    } catch (e) {
      console.log(e);
      return await this.count(where);
    }
  }
}
