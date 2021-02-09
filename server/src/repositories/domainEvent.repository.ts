import {DefaultCrudRepository} from '@loopback/repository';
import {DomainEvent, DomainEventRelations} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DomainEventRepository extends DefaultCrudRepository<DomainEvent,
typeof DomainEvent.prototype.id, DomainEventRelations> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(DomainEvent, dataSource);
  }
}
