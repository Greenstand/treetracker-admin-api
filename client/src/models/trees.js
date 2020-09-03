import { 
  getOrganization,
} from "../api/apiUtils";
import Axios from 'axios'
import { session } from '../models/auth'
import FilterModel from '../models/Filter'

const trees = {
  state: {
    data: [],
    treeCount: 0,
    selected: [],
    tree: {},
    numSelected: 0,
    page: 0,
    rowsPerPage: 25,
    order: 'asc',
    orderBy: 'id',
    allIds: [],
    byId: {},
    displayDrawer: {
      isOpen: false,
    },
    filter: new FilterModel(),
  },
  reducers: {
    selectAll(state) {
      return { ...state }
    },
    getTree(state, tree) {
      return { ...state, tree }
    },
    getTrees(state, payload, request) {
      return {
        ...state,
        data: payload,
        ...request,
      }
    },
    receiveTreeCount(state, payload) {
      return { ...state, treeCount: payload.count }
    },
    receiveLocation(state, payload, { id, address }) {
      if (address === 'cached') {
        return state
      } else {
        const byId = Object.assign({}, state.byId)
        if (byId[id] == null) byId[id] = {}
        byId[id].location = payload.address
        return { ...state, byId }
      }
    },
    // TODO: not quite sure if we need to keep this. I'll leave it until merge
    receiveStatus(state, payload) {
      return { ...state, status: payload }
    },
    toggleDisplayDrawer(state) {
      return { displayDrawer: { isOpen: !state.isOpen } }
    },
    openDisplayDrawer(state) {
      return { displayDrawer: { isOpen: true } }
    },
    closeDisplayDrawer(state) {
      return { displayDrawer: { isOpen: false } }
    },
  },
  effects: {
    async getTreesWithImagesAsync({ page, rowsPerPage, orderBy = 'id', order = 'desc' }) {
      const query = `${
        process.env.REACT_APP_API_ROOT
      }/api/${getOrganization()}trees?filter[order]=${orderBy} ${order}&filter[limit]=${rowsPerPage}&filter[skip]=${
        page * rowsPerPage
      }&filter[fields][imageUrl]=true&filter[fields][lat]=true&filter[fields][lon]=true` +
      `&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][timeUpdated]=true` +
      `&filter[where][active]=true&field[imageURL]`
      Axios.get(query, {
        headers: {
          'content-type': 'application/json',
          Authorization: session.token,
        },
      }).then((response) => {
        this.getTrees(response.data, {
          page: page,
          rowsPerPage: rowsPerPage,
          orderBy: orderBy,
          order: order,
        })
      })
    },
    async getTreesAsync(payload, rootState) {
      // Destruct payload and fill in any gaps from rootState.trees
      const { page, rowsPerPage, filter, orderBy, order } = { ...rootState.trees, ...payload }

      /*
       * first load the page count
       */
      
      let response = await Axios.get(
        `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/count?` +
          (filter ? filter.getBackloopString(false) : ''),
        {
          headers: {
            'content-type': 'application/json',
            Authorization: session.token,
          },
        }
      )
      const data = response.data
      this.receiveTreeCount(data)

      const query =
        `${
          process.env.REACT_APP_API_ROOT
        }/api/${getOrganization()}trees?filter[order]=${orderBy} ${order}&filter[limit]=${rowsPerPage}&filter[skip]=${
          page * rowsPerPage
        }&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][status]=true` +
        `&filter[fields][planterId]=true&filter[where][active]=true` +
        (filter ? filter.getBackloopString() : '')
      response = await Axios.get(query, {
        headers: {
          'content-type': 'application/json',
          Authorization: session.token,
        },
      })
      this.getTrees(response.data, {
        page,
        rowsPerPage,
        orderBy,
        order,
        filter,
      })
    },
    async requestTreeCount(payload, rootState) {
      Axios.get(`${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/count`, {
        headers: {
          'content-type': 'application/json',
          Authorization: session.token,
        },
      }).then((response) => {
        const data = response.data
        this.receiveTreeCount(data)
      })
    },
    async getTreeAsync(id) {
      const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/${id}`
      Axios.get(query, {
        headers: {
          'content-type': 'application/json',
          Authorization: session.token,
        },
      })
        .then((res) => {
          this.getTree(res.data)
        })
        .catch((err) => console.error(`ERROR: FAILED TO GET SELECTED TREE ${err}`))
    },
    async getLocationName(payload, rootState) {
      if (
        (rootState.trees.byId[payload.id] &&
          rootState.trees.byId[payload.id].location &&
          rootState.trees.byId[payload.id].location.lat !== payload.lat &&
          rootState.trees.byId[payload.id].location.lon !== payload.lon) ||
        !rootState.trees.byId[payload.id] ||
        !rootState.trees.byId[payload.id].location
      ) {
        const query = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${payload.latitude}&lon=${payload.longitude}`
        Axios.get(query, {
          headers: {
            'content-type': 'application/json',
            Authorization: session.token,
          },
        }).then((response) => {
          this.receiveLocation(response.data, payload)
        })
      } else {
        this.receiveLocation(null, { id: payload.id, address: 'cached' })
      }
    },
    async markInactiveTree(id) {
      const query = `${process.env.REACT_APP_API_ROOT}/api/${getOrganization()}trees/${id}/`
      const data = { active: false }
      Axios.patch(query, data, {
        headers: {
          'content-type': 'application/json',
          Authorization: session.token,
        },
      }).then((response) => {
        this.receiveStatus(response.status)
      })
    },
    async showTree(id) {},
  },
}

export default trees
