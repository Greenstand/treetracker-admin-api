import { handleResponse, handleError } from "./apiUtils";

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
      `filter[fields][id]=true&` +
      //the filter query
      filter? filter.getBackloopString():"";
    return fetch(query).then(handleResponse).catch(handleError);
  },

  getCount({
    filter,
  }){
    const query = 
      `${process.env.REACT_APP_API_ROOT}/planter?count` + 
      filter? filter.getBackloopString():"";
    return fetch(query).then(handleResponse).catch(handleError);
  },
};
