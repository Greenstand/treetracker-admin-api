export interface DatasourceConfig {
  name: string;
  connector: string;
  url: string;
}

const config: DatasourceConfig = {
  "name": "treetracker_dev",
  "connector": "postgresql",
  "url": process.env.DATABASE_URL || "",
}

if (!config.url) {
  console.log(`DATABASE_URL not set - defaulting to localhost:5432`)
}

function getDatasource() : DatasourceConfig {
  return config;
}

export default getDatasource;
