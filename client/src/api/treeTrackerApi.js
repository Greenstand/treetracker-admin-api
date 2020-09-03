import { 
  handleResponse, 
  handleError,
  getOrganization,
} from "./apiUtils";
import {session} from "../models/auth";



export default {
  getTreeImages({
    skip,
    rowsPerPage,
    orderBy = 'id',
    order = 'desc',
    //the filter model
    filter,
  }) {
    const query =
      `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees?` +
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
      filter.getBackloopString()
    return fetch(query, {
      headers: {
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },

  approveTreeImage(
    id,
    morphology,
    age,
    captureApprovalTag,
    speciesId,
    tags,
  ) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/${id}`;

    return fetch(query, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
      body: JSON.stringify({
        id: id,
        approved: true,
        //revise, if click approved on a rejected pic, then, should set the pic
        //approved, AND restore to ACTIVE = true
        active: true,
        morphology,
        age,
        captureApprovalTag,
        speciesId: speciesId,
      }),
    })
      .then(handleResponse)
      .catch(handleError)
  },
  rejectTreeImage(id, rejectionReason, tags) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/${id}`;
    return fetch(query, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
      body: JSON.stringify({
        id: id,
        active: false,
        //revise, if click a approved pic, then, should set active = false and
        //at the same time, should set approved to false
        approved: false,
        rejectionReason,
      }),
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * to rollback from a wrong approving
   */
  undoTreeImage(id) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/${id}`;
    return fetch(query, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
      body: JSON.stringify({
        id: id,
        active: true,
        approved: false,
      }),
    })
      .then(handleResponse)
      .catch(handleError)
  },
  getUnverifiedTreeCount() {
    const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/count?where[approved]=false&where[active]=true`;
    return fetch(query,{
        headers: {
          Authorization: session.token ,
        }
    }).then(handleResponse).catch(handleError);
  },
  getTreeCount(filter) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/count?${filter.getBackloopString(false)}`;
    return fetch(query, {
      headers: {
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  getTreeById(id) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/${id}`;
    return fetch(query, {
      headers: {
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * get species list
   */
  getSpecies() {
    const query = `${process.env.REACT_APP_API_ROOT}/api/species`
    return fetch(query, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * get species by id
   */
  getSpeciesById(id) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/species/${id}`
    return fetch(query, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * create new species
   */
  createSpecies(name) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/species`
    return fetch(query, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
      body: JSON.stringify({
        name: name,
        desc: name,
        active: 0,
        valueFactor: 0,
      }),
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /* edit specie */
  editSpecies(id, name, desc) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/species/${id}`
    return fetch(query, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
      body: JSON.stringify({
        id: id,
        name: name,
        desc: desc,
        active: 0,
        valueFactor: 0,
      }),
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * delete a specie
   */
  deleteSpecies(id) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/species/${id}`
    return fetch(query, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * get tag list
   */
  getTags(filter) {
    const filterString =
      `filter[limit]=25&` + (filter ? `filter[where][tagName][ilike]=${filter}%` : '')
    const query = `${process.env.REACT_APP_API_ROOT}/api/tags?${filterString}`
    return fetch(query, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * get tag by id
   */
  getTagById(id) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/tags/${id}`
    return fetch(query, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * create new tag
   */
  createTag(tagName) {
    const query = `${process.env.REACT_APP_API_ROOT}/api/tags`
    return fetch(query, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
      body: JSON.stringify({
        tagName,
        active: true,
        public: true,
      }),
    })
      .then(handleResponse)
      .catch(handleError)
  },
  /*
   * create new tree tags
   */
  async createTreeTags(treeId, tags) {
    return tags.map((t) => {
      const query = `${process.env.REACT_APP_API_ROOT}/api/tree_tags`
      return fetch(query, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: session.token,
        },
        body: JSON.stringify({
          treeId,
          tagId: t.id,
        }),
      })
        .then(handleResponse)
        .catch(handleError)
    })
  },
  /*
   * get tags for a given tree
   */
  getTreeTags({ treeId, tagId }) {
    const filterString =
      (treeId ? `filter[where][treeId]=${treeId}` : '') +
      (tagId ? `&filter[where][tagId]=${tagId}` : '')
    const query = `${process.env.REACT_APP_API_ROOT}/api/tree_tags?${filterString}`
    return fetch(query, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Authorization: session.token,
      },
    })
      .then(handleResponse)
      .catch(handleError)
  },
}
