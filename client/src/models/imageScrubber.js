import Axios from "axios";
import { API_ROOT } from '../common/variables.js'


const imageScrubber = {
  state: {
    numSelected: 0,
    page: 0,
    recordsPerPage: 99,
    order: 'asc',
    orderBy: 'timeUpdated',
    selected: [],
    actionNav: {
      'isOpen': false
    }
  },
  reducers: {
    getTree(state, tree) {
      return { ...state, tree };
    },
    toggleSelection(state, payload) {
      const idIsInArray = state.selected.find(el => {
        return el === payload.id
      })
      const newSelected = state.selected.slice()
      if (idIsInArray === payload.id) {
        const index = newSelected.indexOf(payload.id)
        newSelected.splice(index, 1)
        return { ...state, selected: newSelected }
      } else {
        newSelected.unshift(payload.id)
        return { ...state, selected: newSelected }
      }
    },
    addToSelection(state, payload, { id: id }) {
      console.log('addToSelection')
    },
    removeFromSelection(state, payload, { id: id }) {
      console.log('removeFromSelection');
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
    toggleActions(state) {
      return { actionNav: { isOpen: !state.isOpen } }
    },
    openActions(state) {
      return { actionNav: { isOpen: true } }
    },
    closeActions(state) {
      return { actionNav: { isOpen: false } }
    }
  },
  effects: {
    async getTreesWithImagesAsync({ page, rowsPerPage, orderBy = 'id', order = 'asc' }) {
      const query = `${API_ROOT}/trees?filter[order]=${orderBy} ${order}&filter[limit]=${rowsPerPage}&filter[skip]=${page * rowsPerPage}&filter[fields][imageUrl]=true&filter[fields][lat]=true&filter[fields][lon]=true&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][timeUpdated]=true&filter[where][active]=true&field[imageURL]`;
      Axios.get(query)
        .then((response) => {
          this.getTrees(response.data, { page: page, rowsPerPage: rowsPerPage, orderBy: orderBy, order: order });
        })
    },
    async getLocationName(payload, rootState) {
      if ((rootState.trees.byId[payload.id] &&
        rootState.trees.byId[payload.id].location &&
        rootState.trees.byId[payload.id].location.lat !== payload.lat &&
        rootState.trees.byId[payload.id].location.lon !== payload.lon) ||
        (
          !rootState.trees.byId[payload.id] || !rootState.trees.byId[payload.id].location
        )) {
        const query = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${payload.latitude}&lon=${payload.longitude}`
        Axios.get(query)
          .then((response) => {
            this.receiveLocation(response.data, payload)
          })
      } else {
        this.receiveLocation(null, { id: payload.id, address: 'cached' })
      }
    },
    async markTreeInactive(id) {
      const query = `${API_ROOT}/trees/${id}/`;
      const data = { "active": false };
      Axios.patch(query, data)
        .then((response) => {
          this.receiveStatus(response.status);
        })
    },
  }
}

export default imageScrubber
