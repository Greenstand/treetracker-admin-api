import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {Trees, TreesRelations, TreeTag} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {TreeTagRepository} from './tree-tag.repository';
const expect : any = require("expect-runtime");

export class TreesRepository extends DefaultCrudRepository<
  Trees,
  typeof Trees.prototype.id,
  TreesRelations
> {

  public readonly treeTags: HasManyRepositoryFactory<TreeTag, typeof Trees.prototype.id>;

  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource, @repository.getter('TreeTagRepository') protected treeTagRepositoryGetter: Getter<TreeTagRepository>,
  ) {
    super(Trees, dataSource);
    this.treeTags = this.createHasManyRepositoryFactoryFor('treeTags', treeTagRepositoryGetter,);
    this.registerInclusionResolver('treeTags', this.treeTags.inclusionResolver);
  }

  async getEntityIdsByOrganizationId(organizationId : Number):Promise<Array<Number>>{
    expect(organizationId).number();
    expect(this).property("execute").defined();
    const result = await this.execute(`select * from getEntityRelationshipChildren(${organizationId})`, []);
    return result.map(e => e.entity_id);
  }

  async getPlanterIdsByOrganizationId(organizationId : Number):Promise<Array<Number>>{
    expect(organizationId).number();
    const result = await this.execute(`select * from planter where organization_id in (select entity_id from getEntityRelationshipChildren(${organizationId}))`, []);
    expect(result).match([{id: expect.any(Number)}]);
    return result.map(e => e.id);
  }
}
