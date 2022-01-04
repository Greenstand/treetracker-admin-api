import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
  Filter,
  Options,
  Where,
  Count,
} from '@loopback/repository';
import { Trees, TreesRelations, TreeTag } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { TreeTagRepository } from './treeTag.repository';
import expect from 'expect-runtime';
import { buildFilterQuery } from '../js/buildFilterQuery';

export class TreesRepository extends DefaultCrudRepository<
  Trees,
  typeof Trees.prototype.id,
  TreesRelations
> {
  public readonly treeTags: HasManyRepositoryFactory<
    TreeTag,
    typeof Trees.prototype.id
  >;

  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
    @repository.getter('TreeTagRepository')
    protected treeTagRepositoryGetter: Getter<TreeTagRepository>,
  ) {
    super(Trees, dataSource);
    this.treeTags = this.createHasManyRepositoryFactoryFor(
      'treeTags',
      treeTagRepositoryGetter,
    );
    this.registerInclusionResolver('treeTags', this.treeTags.inclusionResolver);
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

  async getOrganizationWhereClause(organizationId: number): Promise<Object> {
    // console.log('getOrganizationWhereClause orgId ---', organizationId);
    if (organizationId === null) {
      const planterIds = await this.getNonOrganizationPlanterIds();
      return {
        and: [
          { plantingOrganizationId: null },
          { planterId: { inq: planterIds } },
        ],
      };
    } else {
      const planterIds = await this.getPlanterIdsByOrganizationId(
        organizationId,
      );
      const entityIds = await this.getEntityIdsByOrganizationId(organizationId);

      return {
        or: [
          { plantingOrganizationId: { inq: entityIds } },
          { planterId: { inq: planterIds } },
        ],
      };
    }
  }

  async applyOrganizationWhereClause(
    where: Object | undefined,
    organizationId: number | undefined,
  ): Promise<Object | undefined> {
    if (!where || organizationId === undefined) {
      return Promise.resolve(where);
    }
    const organizationWhereClause = await this.getOrganizationWhereClause(
      organizationId,
    );
    return {
      and: [where, organizationWhereClause],
    };
  }

  getTreeTagJoinClause(tagId: string): string {
    if (tagId === null) {
      return `LEFT JOIN tree_tag ON trees.id=tree_tag.tree_id WHERE (tree_tag.tag_id ISNULL)`;
    } else if (tagId === "0") {
      return `INNER JOIN tree_tag ON trees.id=tree_tag.tree_id`;
    }
    return `JOIN tree_tag ON trees.id=tree_tag.tree_id WHERE (tree_tag.tag_id=${tagId})`;
  }

  // In order to filter by tagId (treeTags relation), we need to bypass the LoopBack find()
  async findWithTagId(
    filter?: Filter<Trees>,
    tagId?: string,
    options?: Options,
  ): Promise<(Trees & TreesRelations)[]> {
    if (!filter || tagId === undefined) {
      return await this.find(filter, options);
    }

    try {
      if (this.dataSource.connector) {
        // If included, replace 'id' with 'tree_id as id' to avoid ambiguity
        const columnNames = this.dataSource.connector
          .buildColumnNames('Trees', filter)
          .replace('"id"', 'trees.id as "id"');

        const selectStmt = `SELECT ${columnNames} from trees ${this.getTreeTagJoinClause(
          tagId,
        )}`;

        const params = {
          filter,
          repo: this,
          modelName: 'Trees',
        };

        const query = buildFilterQuery(selectStmt, params);

        return <Promise<Trees[]>>await this.execute(
          query.sql,
          query.params,
          options,
        ).then((data) => {
          return data.map((obj) =>
            this.dataSource.connector?.fromRow('Trees', obj),
          );
        });
      } else {
        throw 'Connector not defined';
      }
    } catch (e) {
      console.log(e);
      return await this.find(filter, options);
    }
  }

  // In order to filter by tagId (treeTags relation), we need to bypass the LoopBack count()
  async countWithTagId(
    where?: Where<Trees>,
    tagId?: string,
    options?: Options,
  ): Promise<Count> {
    if (!where || tagId === undefined) {
      return await this.count(where, options);
    }

    try {
      const selectStmt = `SELECT COUNT(*) FROM trees ${this.getTreeTagJoinClause(
        tagId,
      )}`;

      const params = {
        filter: { where },
        repo: this,
        modelName: 'Trees',
      };

      const query = buildFilterQuery(selectStmt, params);

      return <Promise<Count>>await this.execute(
        query.sql,
        query.params,
        options,
      ).then((res) => {
        return (res && res[0]) || { count: 0 };
      });
    } catch (e) {
      console.log(e);
      return await this.count(where, options);
    }
  }
}
