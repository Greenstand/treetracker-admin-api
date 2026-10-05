import { DefaultCrudRepository } from '@loopback/repository';
import { GrowerNote, GrowerNoteRelations } from '../models';
import { TreetrackerDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class GrowerNoteRepository extends DefaultCrudRepository<
  GrowerNote,
  typeof GrowerNote.prototype.id,
  GrowerNoteRelations
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(GrowerNote, dataSource);
  }
}
