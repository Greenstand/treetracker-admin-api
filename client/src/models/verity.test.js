import {init}		from '@rematch/core';
import verity		from './verity';
import Filter		from './Filter';
import * as loglevel		from 'loglevel';

const log		= loglevel.getLogger('../models/verity.test');


describe('verity', () => {
	//{{{
	let store
	let api

	describe('with a default store', () => {
		//{{{
		beforeEach(() => {
			//mock the api
			api		= require('../api/treeTrackerApi').default
			api.getTreeImages		= jest.fn(() => Promise.resolve([{
					id		: '1',
				}]));
			api.approveTreeImage		= () => Promise.resolve(true);
			api.rejectTreeImage		= () => Promise.resolve(true);
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

			it('should call api with param: skip = 0', () => {
				expect(api.getTreeImages.mock.calls[0][0]).toMatchObject({
					skip		: 0,
				})
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


			describe('loadMoreTreeImages() load second page', () => {
				//{{{
				beforeEach(async () => {
					api.getTreeImages.mockClear()
					await store.dispatch.verity.loadMoreTreeImages();
				})

				it('should call api with param: skip = 1', () => {
					expect(api.getTreeImages.mock.calls[0][0]).toMatchObject({
						skip		: 1,
					})
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

	describe('a store with 10 trees', () => {
		//{{{
		beforeEach(() => {
			const verityInit		= {
				state		: {
					...verity.state,
					treeImages		: Array.from(new Array(10)).map((e, i) => {
						return {
							id		: i,
							imageUrl		: 'http://' + i,
						}
					}),
				},
				reducers		: verity.reducers,
				effects		: verity.effects,
			}
			store		= init({
				models		: {
					verity		: verityInit,
				},
			})
		})

		it('the tree images has length 10', () => {
			log.debug(store.getState().verity.treeImages);
			expect(store.getState().verity.treeImages).toHaveLength(10);
		})

		describe('selectAll(true)', () => {
			//{{{
			beforeEach(() => {
				store.dispatch.verity.selectAll(true)
			})

			it('selected should be 10', () => {
				expect(store.getState().verity.treeImagesSelected).toHaveLength(10)
			})

			describe('selectAll(false)', () => {
				//{{{
				beforeEach(() => {
					store.dispatch.verity.selectAll(false)
				})

				it('selected should be 0', () => {
					expect(store.getState().verity.treeImagesSelected).toHaveLength(0)
				})

				//}}}
			})
			//}}}
		})

		describe('clickTree(2)', () => {
			//{{{
			beforeEach(() => {
				store.dispatch.verity.clickTree({treeId:2})
			})

			it('treeImagesSelected should be [2]', () => {
				expect(store.getState().verity.treeImagesSelected).toMatchObject(
					[2]
				)
			})

			it('treeImageAnchor should be 2', () => {
				expect(store.getState().verity.treeImageAnchor).toBe(2)
			})

			describe('clickTree(4)', () => {
				//{{{
				beforeEach(() => {
					store.dispatch.verity.clickTree({treeId:4})
				})

				it('treeImagesSelected should be [4]', () => {
					expect(store.getState().verity.treeImagesSelected).toMatchObject(
						[4]
					)
				})
				//}}}
			})

			describe('clickTree(4, isShift)', () => {
				//{{{
				beforeEach(() => {
					store.dispatch.verity.clickTree({treeId:4, isShift:true})
				})

				it('treeImagesSelected should be [2,3,4]', () => {
					expect(store.getState().verity.treeImagesSelected).toMatchObject(
						[2,3,4]
					)
				})

				describe('approveAll()', () => {
					//{{{
					beforeEach(async () => {
						await store.dispatch.verity.approveAll();
					})

					it('tree images should be 7', () => {
						expect(store.getState().verity.treeImages).toHaveLength(7)
					})

					it('isApproveAllProcessing === false', () => {
						expect(store.getState().verity.isApproveAllProcessing).toBe(false)
					})

					it('after approveAll, some page information should be reset, pagesLoaded = -1', () => {
						expect(store.getState().verity.pagesLoaded).toBe(-1)
					})

					//}}}
				})

				describe('clickTree(0, isShift)', () => {
					//{{{
					beforeEach(() => {
						store.dispatch.verity.clickTree({treeId:0, isShift:true})
					})

					it('treeImagesSelected should be [0,1,2]', () => {
						expect(store.getState().verity.treeImagesSelected).toMatchObject(
							[0, 1, 2]
						)
					})
					//}}}
				})

				describe('clickTree(0)', () => {
					//{{{
					beforeEach(() => {
						store.dispatch.verity.clickTree({treeId:0})
					})

					it('treeImagesSelected should be [0]', () => {
						expect(store.getState().verity.treeImagesSelected).toMatchObject(
							[0]
						)
					})
					//}}}
				})

				//}}}
			})

			//}}}
		})


		//}}}
	})



	//}}}
})

