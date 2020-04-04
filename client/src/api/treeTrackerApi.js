import { handleResponse, handleError } from "./apiUtils";
import { API_ROOT as baseUrl } from "../common/variables.js";

export default {
  getTreeImages({
    skip,
    rowsPerPage,
    orderBy = "id",
    order = "asc",
    //the filter model
    filter
  }) {
    const query =
      `${baseUrl}/trees?` +
      `filter[order]=${orderBy} ${order}&` +
      `filter[limit]=${rowsPerPage}&` +
      `filter[skip]=${skip}&` +
      `filter[fields][imageUrl]=true&` +
      `filter[fields][lat]=true&` +
      `filter[fields][lon]=true&` +
      `filter[fields][id]=true&` +
      `filter[fields][timeCreated]=true&` +
      `filter[fields][timeUpdated]=true&` +
      `filter[fields][active]=true&` +
      `filter[fields][approved]=true&` +
      `filter[fields][planterId]=true&` +
      `filter[fields][deviceId]=true&` +
      `filter[fields][planterIdentifier]=true&` +
      `field[imageURL]` +
      //the filter query
      filter.getBackloopString();
    return fetch(query)
      .then(handleResponse)
      .catch(handleError);
  },
  approveTreeImage(id) {
    const query = `${baseUrl}/trees/${id}`;
    return fetch(query, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: id,
        approved: true,
        //revise, if click approved on a rejected pic, then, should set the pic
        //approved, AND restore to ACTIVE = true
        active: true
      })
    })
      .then(handleResponse)
      .catch(handleError);
  },
  rejectTreeImage(id) {
    const query = `${baseUrl}/trees/${id}`;
    return fetch(query, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: id,
        active: false,
        //revise, if click a approved pic, then, should set active = false and
        //at the same time, should set approved to false
        approved: false
      })
    })
      .then(handleResponse)
      .catch(handleError);
  },
  /*
   * to rollback from a wrong approving
   */
  undoTreeImage(id) {
    const query = `${baseUrl}/trees/${id}`;
    return fetch(query, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: id,
        active: true,
        approved: false
      })
    })
      .then(handleResponse)
      .catch(handleError);
  },
  getUnverifiedTreeCount() {
    const query = `${baseUrl}/trees/count?where[approved]=false&where[active]=true`;
    return fetch(query).then(handleResponse).catch(handleError);
  }
};
