import { DefaultCrudRepository } from '@loopback/repository';
import { TreeTag, TreeTagRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class TreeTagRepository extends DefaultCrudRepository<
  TreeTag,
  typeof TreeTag.prototype.id,
  TreeTagRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(TreeTag, dataSource);
  }
}
