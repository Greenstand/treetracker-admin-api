import {init}		from '@rematch/core';
import verity		from './verity';

jest.mock('../api/treeTrackerApi')

//mock the api
const api		= require('../api/treeTrackerApi')
api.getTreeImages		= () => Promise.resolve([{
		id		: '1',
	}]);
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

		//}}}
	})
	//}}}
})

