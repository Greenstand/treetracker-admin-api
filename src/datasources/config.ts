import pg from 'pg';
if (
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('ssl=false') ||
    process.env.DATABASE_URL.includes('sslmode=disable'))
) {
  pg.defaults.ssl = false;
} else {
  pg.defaults.ssl = { rejectUnauthorized: false };
}
export interface DatasourceConfig {
  name: string;
  connector: string;
  url: string;
}

const config: DatasourceConfig = {
  name: 'treetracker_dev',
  connector: 'postgresql',
  url: process.env.DATABASE_URL || '',
};

if (!config.url) {
  console.log(`DATABASE_URL not set - defaulting to localhost:5432`);
}

function getDatasource(): DatasourceConfig {
  return config;
}

export default getDatasource;
