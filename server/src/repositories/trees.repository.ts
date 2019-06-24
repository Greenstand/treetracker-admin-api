import {DefaultCrudRepository} from '@loopback/repository';
import {Trees, TreesRelations} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TreesRepository extends DefaultCrudRepository<
  Trees,
  typeof Trees.prototype.id,
  TreesRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(Trees, dataSource);
  }
}
