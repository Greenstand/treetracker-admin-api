import {DefaultCrudRepository} from '@loopback/repository';
import {AdminUser, AdminUserRelations} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AdminUserRepository extends DefaultCrudRepository<
  AdminUser,
  typeof AdminUser.prototype.id,
  AdminUserRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(AdminUser, dataSource);
  }
}
