import { handleResponse, handleError } from "./apiUtils";
import { API_ROOT as baseUrl } from "../common/variables.js";

export default {
  get({ skip, rowsPerPage, orderBy = "id", order = "desc", filter }) {
    const query =
      `${baseUrl}/planter?` +
      `filter[order]=${orderBy} ${order}&` +
      `filter[limit]=${rowsPerPage}&` +
      `filter[skip]=${skip}&` +
      `filter[fields][firstName]=true&` +
      `filter[fields][lastName]=true&` +
      `filter[fields][imageUrl]=true&` +
      `filter[fields][id]=true&` +
      //the filter query
      filter.getBackloopString();
    return fetch(query).then(handleResponse).catch(handleError);
  },
};
