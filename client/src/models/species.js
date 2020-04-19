/*
 * The model for species function
 */
import * as loglevel		from 'loglevel'
import api		from '../api/treeTrackerApi'

const log		= loglevel.getLogger('../models/species')

const species = {
	state: {
		speciesList: [],
    speciesInput: '',
	},
	reducers		: {
		setSpeciseList(state, speciesList){
      return {
        ...state,
        speciesList,
      };
		},
    setSpeciesInput(state, text){
      return {
        ...state,
        speciesInput: text,
      }
    },
	},
	effects		: {
    async loadSpeciesList(){
      const speciesList = api.getSpecies()
      this.setSpeciseList(speciesList)
    },
    onChange(text){
      console.log('on change:"', text, '"')
      this.setSpeciesInput(text)
    },
    isNewSpecies(payload, state){
      //if there are some input, and it don't exist, then new species
      if(!state.species.speciesInput){
        log.debug('empty species, false')
        return false
      }
      log.debug(
        'to find species %s in list:%d', 
        state.species.speciesInput,
        state.species.speciesList.length
      )
      return state.species.speciesList.every(c => c.name !== state.species.speciesInput)
    },
    async createSpecies(name){
      const species = await api.createSpecies(name)
      return species
    },
	},
}

export default species
