import React from 'react'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {connect} from 'react-redux'

function Species(props){
  /* load species list when mount*/
  React.useEffect(() => {
    props.speciesDispatch.loadSpeciesList()
  }, [])

  return(
  <Autocomplete
    options={props.speciesState.speciesList}
    getOptionLabel={(option) => option.name}
    style={{ width: 300 }}
    onChange={(a,b,c) => {
      props.speciesDispatch.onChange((b && b.name) || '')
    }}
    onInputChange={(a,b,c) => {
      props.speciesDispatch.onChange(b || '')
    }}
    freeSolo={true}
    renderInput={(params) => 
      <TextField 
        {...params} 
        label="Combo box" 
        variant="outlined" 
      />}
    />
  )
}

export default connect(
  //state
  state => ({
    speciesState: state.species
  }),
  //dispatch
  dispatch => ({
    speciesDispatch: dispatch.species
  })
)(Species);
