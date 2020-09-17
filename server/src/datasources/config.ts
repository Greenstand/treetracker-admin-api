export interface DatasourceConfig {
  name: string;
  connector: string;
  url: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const config: DatasourceConfig =
  process.env.NODE_DB === 'test'
    ? require('./treetrackerTest.datasource.json')
    : require('./treetracker.datasource.json');

function getDatasource(): DatasourceConfig {
  return config;
}

export default getDatasource;
