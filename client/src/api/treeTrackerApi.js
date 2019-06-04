import { handleResponse, handleError } from "./apiUtils";
import { API_ROOT as baseUrl } from "../common/variables.js";

export function getTreeImages({
  page,
  rowsPerPage,
  orderBy = "id",
  order = "desc"
}) {
  const query = `${baseUrl}/trees?filter[order]=${orderBy} ${order}&filter[limit]=${rowsPerPage}&filter[skip]=${page *
    rowsPerPage}&filter[fields][imageUrl]=true&filter[fields][lat]=true&filter[fields][lon]=true&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][timeUpdated]=true&filter[where][active]=true&filter[where][approved]=false&field[imageURL]`;
  return fetch(query)
    .then(handleResponse)
    .catch(handleError);
}

export function approveTreeImage(id) {
  const query = `${baseUrl}/trees/${id}`;
  return fetch(query, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ approved: true })
  })
    .then(handleResponse)
    .catch(handleError);
}

export function rejectTreeImage(id) {
  const query = `${baseUrl}/trees/${id}`;
  return fetch(query, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ active: false })
  })
    .then(handleResponse)
    .catch(handleError);
}
