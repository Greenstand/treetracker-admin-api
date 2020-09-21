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

//check the test env, if this is testing, then the NODE_DB=test must be set
if(process.env.NODE_ENV === 'test' && process.env.NODE_DB !== 'test' ){
  throw new Error("This is test env, please set NODE_DB === 'test'");
}

const config: DatasourceConfig =
  process.env.NODE_DB === 'test'
    ? require('./treetrackerTest.datasource.json')
    : require('./treetracker.datasource.json');

function getDatasource(): DatasourceConfig {
  return config;
}

export default getDatasource;
