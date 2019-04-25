import Axios from 'axios';
import { API_ROOT } from '../common/variables.js';

const trees = {
  state: {
    data: [],
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
      isOpen: false
    }
  },
  reducers: {
    selectAll(state) {
      return { ...state };
    },
    getTree(state, tree) {
      return { ...state, tree };
    },
    getTrees(state, payload, { rowsPerPage, order, orderBy }) {
      return {
        ...state,
        data: payload,
        rowsPerPage: rowsPerPage,
        order: order,
        orderBy: orderBy
      };
    },
    receiveTreeCount(state, payload) {
      return { ...state, treeCount: payload.count };
    },
    receiveLocation(state, payload, { id, address }) {
      if (address === 'cached') {
        return state;
      } else {
        const byId = Object.assign({}, state.byId);
        if (byId[id] == null) byId[id] = {};
        byId[id].location = payload.address;
        return { ...state, byId };
      }
    },
    // TODO: not quite sure if we need to keep this. I'll leave it until merge
    receiveStatus(state, payload) {
      return { ...state, status: payload };
    },
    toggleDisplayDrawer(state) {
      return { displayDrawer: { isOpen: !state.isOpen } };
    },
    openDisplayDrawer(state) {
      return { displayDrawer: { isOpen: true } };
    },
    closeDisplayDrawer(state) {
      return { displayDrawer: { isOpen: false } };
    }
  },
  effects: {
    async getTreesWithImagesAsync({
      page,
      rowsPerPage,
      orderBy = 'id',
      order = 'asc'
    }) {
      const query = `${API_ROOT}/trees?filter[order]=${orderBy} ${order}&filter[limit]=${rowsPerPage}&filter[skip]=${page *
        rowsPerPage}&filter[fields][imageUrl]=true&filter[fields][lat]=true&filter[fields][lon]=true&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][timeUpdated]=true&filter[where][active]=true&field[imageURL]`;
      Axios.get(query).then(response => {
        this.getTrees(response.data, {
          page: page,
          rowsPerPage: rowsPerPage,
          orderBy: orderBy,
          order: order
        });
      });
    },
    async getTreesAsync({ page, rowsPerPage, orderBy = 'id', order = 'asc' }) {
      const query = `${API_ROOT}/trees?filter[order]=${orderBy} ${order}&filter[limit]=${rowsPerPage}&filter[skip]=${page *
        rowsPerPage}&filter[fields][lat]=true&filter[fields][lon]=true&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][timeUpdated]=true&filter[where][active]=true`;
      Axios.get(query).then(response => {
        this.getTrees(response.data, {
          rowsPerPage: rowsPerPage,
          orderBy: orderBy,
          order: order
        });
      });
    },
    async requestTreeCount(payload, rootState) {
      Axios.get(`${API_ROOT}/Trees/count`).then(response => {
        const data = response.data;
        this.receiveTreeCount(data);
      });
    },
    async getTreeAsync(id) {
      const query = `${API_ROOT}/Trees/${id}`;
      Axios.get(query)
        .then(res => {
          this.getTree(res.data);
        })
        .catch(err =>
          console.error(`ERROR: FAILED TO GET SELECTED TREE ${err}`)
        );
    },
    async getLocationName(payload, rootState) {
      if (
        (rootState.trees.byId[payload.id] &&
          rootState.trees.byId[payload.id].location &&
          rootState.trees.byId[payload.id].location.lat !== payload.lat &&
          rootState.trees.byId[payload.id].location.lon !== payload.lon) ||
        (!rootState.trees.byId[payload.id] ||
          !rootState.trees.byId[payload.id].location)
      ) {
        const query = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${
          payload.latitude
        }&lon=${payload.longitude}`;
        Axios.get(query).then(response => {
          this.receiveLocation(response.data, payload);
        });
      } else {
        this.receiveLocation(null, { id: payload.id, address: 'cached' });
      }
    },
    async markInactiveTree(id) {
      const query = `${API_ROOT}/trees/${id}/`;
      const data = { active: false };
      Axios.patch(query, data).then(response => {
        this.receiveStatus(response.status);
      });
    },
    async showTree(id) {},
    async sortTrees(payload, rootState) {
      const { page, rowsPerPage, order } = rootState.trees;
      const newOrder = order === 'asc' ? 'desc' : 'asc';
      const query = `${API_ROOT}/trees?filter[order]=${
        payload.orderBy
      } ${newOrder}&filter[limit]=${rowsPerPage}&filter[skip]=${page *
        rowsPerPage}&filter[fields][lat]=true&filter[fields][lon]=true&filter[fields][id]=true&filter[fields][timeCreated]=true&filter[fields][timeUpdated]=true`;
      Axios.get(query).then(response => {
        this.getTrees(response.data, {
          page: page,
          rowsPerPage: rowsPerPage,
          orderBy: payload.orderBy,
          order: newOrder
        });
      });
    }
  }
};

export default trees;
