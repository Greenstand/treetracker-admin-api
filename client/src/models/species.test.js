import {init}		from '@rematch/core';
import species		from './species';
import * as loglevel		from 'loglevel';

const log		= loglevel.getLogger('../models/species.test');


describe('species', () => {
	//{{{
	let store
	let api

	beforeEach(() => {
		//mock the api
		api		= require('../api/treeTrackerApi').default
    api.getSpecies = () => {
      log.debug('mock getSpecies:')
      return Promise.resolve([{
        id: 0,
        name: 'apple',
      },{
        id: 1,
        name: 'pine',
      }])
    }
    api.createSpecies = jest.fn(() => {
      log.debug('mock createSpecies')
      return Promise.resolve({
        id: 2,
        name: 'm',
      })
    })
	})

	describe('with a default store', () => {
		//{{{
		beforeEach(() => {
			store		= init({
				models		: {
					species,
				},
			})
		})

    describe('load species', () => {
      beforeEach(async () => {
        await store.dispatch.species.loadSpeciesList()
      })

      it('loaded 2 species', () => {
        expect(store.getState().species.speciesList).toHaveLength(2)
      })

      describe('input: water melon, create species', () => {
        beforeEach(async () => {
          await store.dispatch.species.onChange('water melon')
          await store.dispatch.species.createSpecies()
        })

        it('api.createSpecies should be called with water melon', () => {
          expect(api.createSpecies.mock.calls[0][0]).toBe('water melon')
        })

        it('specis list should be 3(added)', () => {
          expect(store.getState().species.speciesList).toHaveLength(3)
        })
      })

    })

		//}}}
	})

	//}}}
})

