const json = require("./treetracker.datasource.json");
const jsonTest = require("./treetrackerTest.datasource.json");

function getDatasource(){
  const config = process.env.NODE_DB === "test" ?
    jsonTest
  :
    json;
  return config;
}

export default getDatasource;
