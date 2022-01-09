import { Constructor, inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { TreetrackerDataSource } from '../datasources';
import { UtilsRepositoryMixin } from '../mixins/utils.repository-mixin';
import { Organization, OrganizationRelations } from '../models';

export class OrganizationRepository extends UtilsRepositoryMixin<
  Organization,
  Constructor<
    DefaultCrudRepository<
      Organization,
      typeof Organization.prototype.id,
      OrganizationRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(Organization, dataSource);
  }
}
