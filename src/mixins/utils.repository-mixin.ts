import { MixinTarget } from '@loopback/core';
import { CrudRepository, Model } from '@loopback/repository';
import expect from 'expect-runtime';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function UtilsRepositoryMixin<
  M extends Model,
  R extends MixinTarget<CrudRepository<M>>,
>(superClass: R) {
  return class extends superClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    // put the shared code here
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
      model: string,
    ): Promise<Object | undefined> {
      if (!where || organizationId === undefined) {
        return Promise.resolve(where);
      }

      // if planter or tree repository request
      if (model === 'trees' || model === 'planter') {
        const organizationWhereClause = await this.getOrganizationWhereClause(
          organizationId,
          model,
        );
        return {
          and: [where, organizationWhereClause],
        };
      } else {
        const entityIds = await this.getEntityIdsByOrganizationId(
          organizationId,
        );
        return {
          and: [where, { id: { inq: entityIds } }],
        };
      }
    }

    async getPlanterIdsByOrganizationId(
      organizationId: number,
    ): Promise<Array<number>> {
      expect(organizationId).number();
      const result = await this.execute(
        `select * from planter where organization_id in (select entity_id from getEntityRelationshipChildren(${organizationId}))`,
        [],
      );
      expect(result).match([{ id: expect.any(Number) }]);
      return result.map((e) => e.id);
    }

    async getNonOrganizationPlanterIds(): Promise<Array<number>> {
      const result = await this.execute(
        `select * from planter where organization_id isnull`,
        [],
      );
      expect(result).match([{ id: expect.any(Number) }]);
      return result.map((e) => e.id);
    }

    async getOrganizationWhereClause(
      organizationId: number,
      model: string,
    ): Promise<Object> {
      if (organizationId === null) {
        const planterIds = await this.getNonOrganizationPlanterIds();
        // if planter repository request
        if (model === 'planter') {
          // return {
          //   and: [
          //     { organizationId: null },
          //     { 'planter.id': { inq: planterIds } },
          //   ],
          // };
          // could just do this if we didn't need to use 'planter.id' to avoid errors with adding other filters
          return { id: { inq: planterIds } };
        } else {
          // if trees or other repository request
          return {
            and: [
              { plantingOrganizationId: null },
              { planterId: { inq: planterIds } },
            ],
          };
        }
      } else {
        const planterIds = await this.getPlanterIdsByOrganizationId(
          organizationId,
        );
        const entityIds = await this.getEntityIdsByOrganizationId(
          organizationId,
        );
        // if planter repository request
        if (model === 'planter') {
          return {
            or: [
              { organizationId: { inq: entityIds } },
              { 'planter.id': { inq: planterIds } },
            ],
          };
        } else {
          // if trees or other repository request
          return {
            or: [
              { plantingOrganizationId: { inq: entityIds } },
              { planterId: { inq: planterIds } },
            ],
          };
        }
      }
    }
  };
}
