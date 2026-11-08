import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { TreetrackerDataSource } from '../datasources';
import { GrowerNote } from '../models';

export class GrowerNoteRepository extends DefaultCrudRepository<
  GrowerNote,
  typeof GrowerNote.prototype.id
> {
  constructor(
    @inject('datasources.treetracker') dataSource: TreetrackerDataSource,
  ) {
    super(GrowerNote, dataSource);
  }
}
