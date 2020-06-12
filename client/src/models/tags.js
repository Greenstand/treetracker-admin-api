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
        (a,b) => a.value.localeCompare(b.value)
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
      const tagList = await api.getTags(filter)
      log.debug('load tags from api:', tagList.length)
      this.setTagList(tagList)
    },
    onChange(tags){
      console.log('on change:"', tags, '"')
      this.setTagInput(tags)
    },
    /*
     * check for new tags in tagInput and add them to the tagList
     */
    updateTagList(payload, state){
      state.tags.tagInput.forEach(async t => {
        const value = t.value;
        const tag = await api.createTag(value)
        console.debug('created new tag:', tag.value)
      })
    },
	},
}

export default tags
