import { DefaultCrudRepository } from '@loopback/repository';
import { Organization, OrganizationRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';
import expect from 'expect-runtime';

export class OrganizationRepository extends DefaultCrudRepository<
  Organization,
  typeof Organization.prototype.id,
  OrganizationRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(Organization, dataSource);
  }

  async getEntityIdsByOrganizationId(
    organizationId: number,
  ): Promise<Array<number>> {
    expect(organizationId).number();
    expect(this).property('execute').defined();
    const result = await this.execute(
      `select * from getEntityRelationshipChildren(${organizationId})`,
      [],
    );
    return result.map((e) => e.entity_id);
  }

  async applyOrganizationWhereClause(
    where: Object | undefined,
    organizationId: number | undefined,
  ): Promise<Object | undefined> {
    if (!where || organizationId === undefined) {
      return Promise.resolve(where);
    }
    const entityIds = await this.getEntityIdsByOrganizationId(organizationId);
    return {
      and: [where, { id: { inq: entityIds } }],
    };
  }
}
