export interface DatasourceConfig {
  name: string;
  connector: string;
  url: string;
  ssl: {
    rejectUnauthorized: boolean;
  };
  connectionTimeoutMillis: number;
}

const databaseUrl = process.env.DATABASE_URL || '';

const config: DatasourceConfig = {
  name: 'treetracker_dev',
  connector: 'postgresql',
  url: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  // pg expects connectionTimeoutMillis on the pool config.
  connectionTimeoutMillis: 10000,
};

if (!config.url) {
  console.log('DATABASE_URL not set; relying on local postgres defaults');
}

function getDatasource(): DatasourceConfig {
  return config;
}

export default getDatasource;
