import { DefaultCrudRepository } from '@loopback/repository';
import { Organization, OrganizationRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';
import expect from 'expect-runtime';
import { utils } from '../js/utils';

export type CreateOrganizationData = {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  mapName?: string;
};

function normalizeRequiredValue(value: string): string {
  return value.trim();
}

function normalizeOptionalValue(value?: string): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

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

  async createOrganization(
    organization: CreateOrganizationData,
  ): Promise<Organization> {
    console.log('organization', organization);
    const dbOrganization = utils.convertDB({
      type: 'o',
      name: normalizeRequiredValue(organization.name),
      email: normalizeRequiredValue(organization.email),
      phone: normalizeOptionalValue(organization.phone),
      pwdResetRequired: false,
      website: normalizeOptionalValue(organization.website),
      logoUrl: normalizeOptionalValue(organization.logoUrl),
      mapName: normalizeOptionalValue(organization.mapName),
    });

    const dbEntries = Object.entries(dbOrganization);
    const columns = dbEntries.map(([key]) => key);
    const values = dbEntries.map(([, value]) => value);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const query = `insert into entity (${columns.join(
      ', ',
    )}) values (${placeholders.join(', ')}) returning *`;
    console.log('query', query, values);
    let result: Array<Record<string, unknown>> | undefined;
    try {
      result = (await this.execute(query, values)) as
        | Array<Record<string, unknown>>
        | undefined;
    } catch (e) {
      console.log('error while creating organization', e);
      throw e;
    }

    if (!result?.length) {
      throw new Error('Organization was not created');
    }

    return utils.convertCamel(result[0]) as Organization;
  }
}
