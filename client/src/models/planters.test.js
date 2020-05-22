import { init } from "@rematch/core";
import planters from "./planters";
import * as loglevel from "loglevel";
import api from "../api/planters";

jest.mock("../api/planters");

const log = loglevel.getLogger("../models/planter.test");

describe("planter", () => {
  //{{{
  let store;
  let planter = {
    name: "OK",
  };

  beforeEach(() => {
    //mock the api
    //		api		= require('../api/treeTrackerApi').default
    //		api.getTreeImages		= jest.fn(() => Promise.resolve([{
    //				id		: '1',
    //			}]));
    //		api.approveTreeImage		= jest.fn(() => Promise.resolve(true));
    //		api.rejectTreeImage		= jest.fn(() => Promise.resolve(true));
    //		api.undoTreeImage		= () => Promise.resolve(true);
    //    api.getUnverifiedTreeCount = () => Promise.resolve({
    //      count   : 1
    //    });
  });

  describe("with a default store", () => {
    //{{{
    beforeEach(async () => {
      store = init({
        models: {
          planters,
        },
      });
      //set page size
      expect(store.getState().planters.pageSize).toBe(20);
      await store.dispatch.planters.changePageSize({ pageSize: 1 });
      expect(store.getState().planters.pageSize).toBe(1);
    });

    it("check initial state", () => {
      expect(store.getState().planters.planters).toBeInstanceOf(Array);
      expect(store.getState().planters.planters).toHaveLength(0);
    });

    describe("load(1) ", () => {
      beforeEach(async () => {
        api.getPlanters.mockReturnValue([planter]);
        const result = await store.dispatch.planters.load({
          pageNumber: 1,
        });
        expect(result).toBe(true);
      });

      it("should get some trees", () => {
        expect(store.getState().planters.planters).toHaveLength(1);
      });

      it("should call api with param: skip = 0", () => {
        expect(api.getPlanters).toHaveBeenCalledWith({
          skip: 0,
          rowsPerPage: 1,
        });
      });

      describe("load(2)", () => {
        beforeEach(async () => {
          api.getPlanters.mockReturnValue([planter]);
          const result = await store.dispatch.planters.load({
            pageNumber: 2,
          });
          expect(result).toBe(true);
        });

        it("should get some trees", () => {
          expect(store.getState().planters.planters).toHaveLength(1);
        });

        it("should call api with param: skip = 1", () => {
          expect(api.getPlanters).toHaveBeenCalledWith({
            skip: 1,
            rowsPerPage: 1,
          });
        });
      });

      describe("count()", () => {

        beforeEach(async () => {
          api.getCount.mockReturnValue(2);
          expect(await store.dispatch.planters.count()).toBe(true);
        });

        it("Should get count = 2, page count = 2", async () => {
          expect(store.getState().planters.count).toBe(2);
          expect(store.getState().planters.pageCount).toBe(2);
        });

      });
    });
  });
});
