import {DefaultCrudRepository} from '@loopback/repository';
import {Tag, TagRelations} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TagRepository extends DefaultCrudRepository<
  Tag,
  typeof Tag.prototype.id,
  TagRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(Tag, dataSource);
  }
}

