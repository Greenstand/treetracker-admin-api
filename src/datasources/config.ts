export interface DatasourceConfig {
  name: string;
  connector: string;
  url: string;
  ssl: {
    rejectUnauthorized: boolean;
  };
}

const config: DatasourceConfig = {
  name: 'treetracker_dev',
  connector: 'postgresql',
  url: process.env.DATABASE_URL || '',
  ssl: {
    rejectUnauthorized: false,
  },
};

if (!config.url) {
  console.log(`DATABASE_URL not set - defaulting to localhost:5432`);
}

function getDatasource(): DatasourceConfig {
  return config;
}

export default getDatasource;
