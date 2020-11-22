import { 
  handleResponse, 
  handleError,
  getOrganization,
} from "./apiUtils";
import {session} from "../models/auth";

export default {
  getPlanter(id) {
    const apiRoot = `${process.env.REACT_APP_API_ROOT}/api`;
    const planterQuery = `${apiRoot}/${getOrganization()}planter/${id}`;
    const registrationQuery = `${apiRoot}/planter_registration/?filter=where[planterId]=${id}`;

    return Promise.all([
      fetch(planterQuery, {
        method: "GET",
        headers: { 
          "content-type": "application/json" ,
          Authorization: session.token ,
        },
      }),
      fetch(registrationQuery, {
        method: "GET",
        headers: { 
          "content-type": "application/json" ,
          Authorization: session.token ,
        },
      })
    ])
    .then(responses => {
      let planter = responses[0]
      const registrations = responses[1]
      if (registrations.length) {
        planter.lat = registrations[0].lat;
        planter.lon = registrations[0].lon;
        planter.createdAt = registrations[0].createdAt;
      }
      return planter;
    })
      .then(handleResponse)
      .catch(handleError);
  },

  getPlanters({ skip, rowsPerPage, orderBy = "id", order = "desc", filter }) {
    const query =
      `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}planter?` +
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
      `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}planter/count?${
        filter && filter.getBackloopString(false)
      }`
    return fetch(query,{
      headers: { 
        "content-type": "application/json" ,
        Authorization: session.token ,
      },
    }).then(handleResponse).catch(handleError);
  },
};
