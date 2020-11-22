import {DefaultCrudRepository} from '@loopback/repository';
import {PlanterRegistration, PlanterRegistrationRelations} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PlanterRegistrationRepository extends DefaultCrudRepository<
  PlanterRegistration,
  typeof PlanterRegistration.prototype.id,
  PlanterRegistrationRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(PlanterRegistration, dataSource);
  }
}
