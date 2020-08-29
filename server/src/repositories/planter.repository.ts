import { DefaultCrudRepository } from '@loopback/repository';
import { Planter, PlanterRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';

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
}
