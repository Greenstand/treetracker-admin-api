/*
 * The model for tag function
 */
import * as loglevel from 'loglevel'
import api from '../api/treeTrackerApi'

const log		= loglevel.getLogger('../models/tags')

const tags = {
	state: {
		tagList: [],
    tagInput: [],
	},
	reducers: {
		setTagList(state, tagList){
      const sortedTagList = tagList.slice().sort(
        (a,b) => a.tagName.localeCompare(b.tagName)
      )
      return {
        ...state,
        tagList: sortedTagList,
      };
		},
    setTagInput(state, tags){
      return {
        ...state,
        tagInput: tags,
      }
    },
	},
	effects: {
    async getTags(filter){
      if (filter && filter.length) {
        const tagList = await api.getTags(filter)
        log.debug('load tags from api:', tagList.length)
        this.setTagList(tagList)
      } else {
        this.setTagList([])
      }
    },
    /*
     * check for new tags in tagInput and add them to the database
     */
    createTags(payload, state){
      const savedTags = state.tags.tagInput.map(async t => {
        return api.createTag(t)
      })

      return Promise.all(savedTags)
    },
	},
}

export default tags
