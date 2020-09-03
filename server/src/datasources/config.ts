const config = process.env.NODE_DB === "test" ?
  require("./treetrackerTest.datasource.json")
:
  require("./treetracker.datasource.json");

function getDatasource(){
  return config;
}

export default getDatasource;
