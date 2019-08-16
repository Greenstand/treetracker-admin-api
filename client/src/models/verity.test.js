import {init}		from '@rematch/core';
import verity		from './verity';
import Filter		from './Filter';

//mock the api
const api		= require('../api/treeTrackerApi').default
api.getTreeImages		= jest.fn(() => Promise.resolve([{
		id		: '1',
	}]));
api.approveTreeImage		= () => Promise.resolve(true);
api.rejectTreeImage		= () => Promise.resolve(true);

describe('verity', () => {
	//{{{
	let store

	beforeEach(() => {
		store		= init({
			models		: {
				verity,
			},
		})
	})

	it('check initial state', () => {
		expect(store.getState().verity.isLoading).toBe(false)
	})

	describe('loadMoreTreeImages() ', () => {
		//{{{
		beforeEach(async () => {
			const result		= await store.dispatch.verity.loadMoreTreeImages() 
			expect(result).toBe(true)
		})

		it('should get some trees', () => {
			expect(store.getState().verity.treeImages).toHaveLength(1)
		})

		it('by default, should call tree api with filter: approve=false, active=true', () => {
			expect(api.getTreeImages.mock.calls[0][0]).toMatchObject({
				filter		: {
					approved		: false,
					active		: true,
				},
			})
		})

		describe('approveTreeImage(1)', () => {
			//{{{
			beforeEach(async () => {
				const result		= await store.dispatch.verity.approveTreeImage('1');
				expect(result).toBe(true)
			})

			it('state tree list should removed the tree, so, get []', () => {
				expect(store.getState().verity.treeImages).toHaveLength(0)
			})

			//}}}
		})

		describe('rejectTreeImage(1)', () => {
			//{{{
			beforeEach(async () => {
				const result		= await store.dispatch.verity.rejectTreeImage('1');
				expect(result).toBe(true)
			})

			it('state tree list should removed the tree, so, get []', () => {
				expect(store.getState().verity.treeImages).toHaveLength(0)
			})

			//}}}
		})

		describe('approveAll()', () => {
			//{{{
			beforeEach(async () => {
				await store.dispatch.verity.approveAll();
			})

			it('tree images should be 0', () => {
				expect(store.getState().verity.treeImages).toHaveLength(0)
			})

			it('isApproveAllProcessing === false', () => {
				expect(store.getState().verity.isApproveAllProcessing).toBe(false)
			})

			it('after approveAll, some page information should be reset, pagesLoaded = -1', () => {
				expect(store.getState().verity.pagesLoaded).toBe(-1)
			})

			//}}}
		})

		describe('updateFilter({approved:false, active:false}) test filter', () =>{
			//{{{
			beforeEach(async () => {
				//clear
				api.getTreeImages.mockClear();
				const filter		= new Filter();
				filter.approved		= false;
				filter.active		= false;
				await store.dispatch.verity.updateFilter(filter);
			})

			it('after updateFilter, should call load trees with filter(approved:false, active:false)', () => {
				expect(api.getTreeImages.mock.calls[0][0]).toMatchObject({
					filter		: {
						approved		: false,
						active		: false,
					},
				})
			})
			//}}}
		})

		//}}}
	})
	//}}}
})

