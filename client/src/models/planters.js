/*
 * The model for planter page
 */
import api from "../api/planters";
import FilterPlanter from "./FilterPlanter";

const planters = {
  state: {
    planters: [],
    pageSize: 24,
    count: null,
    currentPage: 0,
    filter: new FilterPlanter(),
    isLoading: false,
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
      }
    },
    setFilter(state, filter){
      return {
        ...state,
        filter,
      }
    },
    setIsLoading(state, isLoading){
      return {
        ...state,
        isLoading,
      }
    }
  },
  effects: {
    /*
     * payload: {
     *  pageNumber,
     * }
     */
    async getPlanter(payload, state){
      this.setIsLoading(true);
      const planter = await api.getPlanter(payload.id);
      this.setPlanters([planter, ...state.planters.planters]);
      this.setIsLoading(false);
      return planter;
    },

    async load(payload, state){
      this.setIsLoading(true);
      const filter = payload.filter || state.planters.filter || new FilterPlanter()
      const pageNumber = payload.pageNumber === undefined ? state.payload.pageNumber : payload.pageNumber
      const planters = await api.getPlanters({
        skip: pageNumber * state.planters.pageSize,
        rowsPerPage: state.planters.pageSize,
        filter,
      });
      //TODO should use single reducer to get faster
      this.setPlanters(planters);
      this.setCurrentPage(pageNumber);
      this.setFilter(filter);
      this.setIsLoading(false);
      return true;
    },
    async changePageSize(payload, state){
      this.setPageSize(payload.pageSize);
    },
    async count(payload, state){
      const {count} = await api.getCount({filter: state.planters.filter});
      this.setCount(count);
      return true;
    },
  },
};

export default planters;
