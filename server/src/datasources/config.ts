import json from "./treetracker.datasource.json";
import jsonTest from "./treetrackerTest.datasource.json";

function getDatasource(){
  const config = process.env.NODE_DB === "test" ?
    jsonTest
  :
    json;
  return config;
}

export default getDatasource;
