/*
 * The model for planter page
 */
import * as loglevel from "loglevel";
import api from "../api/planters";
import FilterPlanter from "./FilterPlanter";

const log = loglevel.getLogger("../models/planters");

const planters = {
  state: {
    planters: [],
    pageSize: 21,
    count: 0,
    pageCount: 0,
    currentPage: 0,
    filter: new FilterPlanter(),
  },
  reducers: {
    setPlanters(state, planters){
      return {
        ...state,
        planters
      };
    },
    setCurrentPage(state, currentPage){
      return {
        ...state,
        currentPage,
      }
    },
    setPageSize(state, pageSize){
      return {
        ...state,
        pageSize,
      }
    },
    setCount(state, count){
      return {
        ...state,
        count,
        pageCount: Math.ceil(count / state.pageSize),
      }
    },
    setFilter(state, filter){
      return {
        ...state,
        filter,
      }
    },
  },
  effects: {
    /*
     * payload: {
     *  pageNumber,
     * }
     */
    async load(payload, state){
      const planters = await api.getPlanters({
        skip: (payload.pageNumber - 1) * state.planters.pageSize,
        rowsPerPage: state.planters.pageSize,
        filter: payload.filter,
      });
      //TODO should use single reducer to get faster
      this.setPlanters(planters);
      this.setCurrentPage(payload.pageNumber);
      this.setFilter(payload.filter);
      return true;
    },
    async changePageSize(payload, state){
      this.setPageSize(payload.pageSize);
    },
    async count(payload, state){
      const count = await api.getCount({});
      this.setCount(count);
      return true;
    },
  },
};

export default planters;
