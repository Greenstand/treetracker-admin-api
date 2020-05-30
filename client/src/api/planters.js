import { handleResponse, handleError } from "./apiUtils";
import {session} from "../models/auth";

export default {
  getPlanters({ skip, rowsPerPage, orderBy = "id", order = "desc", filter }) {
    const query =
      `${process.env.REACT_APP_API_ROOT}/planter?` +
      `filter[order]=${orderBy} ${order}&` +
      `filter[limit]=${rowsPerPage}&` +
      `filter[skip]=${skip}&` +
      `filter[fields][firstName]=true&` +
      `filter[fields][lastName]=true&` +
      `filter[fields][imageUrl]=true&` +
      `filter[fields][email]=true&` +
      `filter[fields][phone]=true&` +
      `filter[fields][personId]=true&` +
      `filter[fields][organization]=true&` +
      `filter[fields][organizationId]=true&` +
      `filter[fields][id]=true&` +
      //the filter query
      (filter? filter.getBackloopString():"");
    return fetch(query,{
      headers: { 
        "content-type": "application/json" ,
        Authorization: session.token ,
      },
    }).then(handleResponse).catch(handleError);
  },

  getCount({
    filter,
  }){
    const query = 
      `${process.env.REACT_APP_API_ROOT}/planter/count` + 
      (filter? filter.getBackloopString():"");
    return fetch(query,{
      headers: { 
        "content-type": "application/json" ,
        Authorization: session.token ,
      },
    }).then(handleResponse).catch(handleError);
  },
};
