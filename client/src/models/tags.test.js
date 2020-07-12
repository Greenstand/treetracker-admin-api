import {init} from '@rematch/core';
import tags from './tags';
import * as loglevel from 'loglevel';

const log = loglevel.getLogger('../models/tags.test');


describe('tags', () => {
  //{{{
  let store
  let api

  beforeEach(() => {
    //mock the api
    api    = require('../api/treeTrackerApi').default
    api.getTags = (filter) => {
      log.debug('mock getTags:')
      return Promise.resolve([{
        id: 0,
        tagName: 'a_tag',
        public: true,
        active: true,
      },{
        id: 1,
        tagName: 'another_tag',
        public: true,
        active: true,
      }])
    }
    api.createTag = jest.fn((tagName) => {
      log.debug('mock createTag')
      return Promise.resolve({
        id: 2,
        tagName: 'new_tag',
        public: true,
        active: true,
      })
    })
  })

  describe('with a default store', () => {
    //{{{
    beforeEach(() => {
      store    = init({
        models    : {
          tags,
        },
      })
    })

    describe('query existing tags - empty', () => {
      beforeEach(async () => {
        await store.dispatch.tags.getTags()
      })

      it('loaded 0 tags', () => {
        expect(store.getState().tags.tagList).toHaveLength(0)
      })
    })

    describe('query existing tags', () => {
      beforeEach(async () => {
        await store.dispatch.tags.getTags('a')
      })

      it('loaded 2 tags', () => {
        expect(store.getState().tags.tagList).toHaveLength(2)
      })

      it('tags are sorted alphabetically', () => {
        const tagNames = store.getState().tags.tagList.map(el => el.tagName);
        expect(tagNames).toStrictEqual(['a_tag','another_tag'])
      })

      describe('input: new_tag, create tags', () => {
        beforeEach(async () => {
          await store.dispatch.tags.setTagInput(['newly_created_tag'])
          await store.dispatch.tags.createTags()
        })

        it('api.createTag should be called with newly_created_tag', () => {
          expect(api.createTag.mock.calls[0][0]).toBe('newly_created_tag')
        })
      })

    })

    //}}}
  })

  //}}}
})

