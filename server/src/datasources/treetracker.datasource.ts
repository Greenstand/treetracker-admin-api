import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import getDatasource from "./config";
const config = getDatasource();

export class TreetrackerDataSource extends juggler.DataSource {
  static dataSourceName = 'treetracker';

  constructor(
    @inject('datasources.config.treetracker', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
