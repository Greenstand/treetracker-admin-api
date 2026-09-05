import { DefaultCrudRepository } from '@loopback/repository';
import { OrganizationSpecies, OrganizationSpeciesRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class OrganizationSpeciesRepository extends DefaultCrudRepository<
  OrganizationSpecies,
  typeof OrganizationSpecies.prototype.id,
  OrganizationSpeciesRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(OrganizationSpecies, dataSource);
  }
}
