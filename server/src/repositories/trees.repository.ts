import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {Trees, TreesRelations, TreeTag} from '../models';
import {TreetrackerDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {TreeTagRepository} from './tree-tag.repository';

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
}
