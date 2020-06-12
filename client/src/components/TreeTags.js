import React from 'react'
import { connect } from 'react-redux'
import ChipInput from 'material-ui-chip-input'
import Autosuggest from 'react-autosuggest'
// import match from 'autosuggest-highlight/match'
// import parse from 'autosuggest-highlight/parse'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    left: 0,
    right: 0,
    zIndex: 1,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  textField: {
    width: '100%',
  },
  chipInput: {
    '&.MuiOutlinedInput-root': {
      padding: theme.spacing(2,0,0,2),
    },
  },
}))

function renderSuggestion (suggestion, { query, isHighlighted }) {
  // const matches = match(suggestion.value, query)
  // const parts = parse(suggestion.value, matches)

  return (
    <MenuItem
      selected={isHighlighted}
      component='div'
      onMouseDown={(e) => e.preventDefault()} // prevent the click causing the input to be blurred
    >
      <div>
        {suggestion.value}
        {/* {parts.map((part, index) => {
           return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <span key={String(index)}>
              {part.text}
            </span>
          )
        })} */}
      </div>
    </MenuItem>
  )
}

function renderSuggestionsContainer (options) {
  const { containerProps, children } = options

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  )
}

function getSuggestionValue (suggestion) {
  return suggestion.value
}


const TreeTags = (props) => {

  const classes = useStyles(props);
  const {...rest} = props
  const [ textFieldInput, setTextFieldInput ] = React.useState('');
  const [ value, setValue ] = React.useState([]);

  function renderInput (inputProps) {
    const { value, onChange, chips, ...other } = inputProps
  
    return (
      <ChipInput
        clearInputValueOnChange
        onUpdateInput={onChange}
        value={chips}
        {...other}
        variant='outlined'
        fullWidth
        classes={{inputRoot: classes.chipInput}}
        allowDuplicates={false}
        blurBehavior='clear'
      />
    )
  }
  
  let handleSuggestionsFetchRequested = ({ value }) => {
    props.tagDispatch.getTags(value)
  }

  let handleSuggestionsClearRequested = () => {
    props.tagDispatch.setTagList([])
  }

  let handletextFieldInputChange = (event, { newValue }) => {
    setTextFieldInput(newValue)
  }

  let handleAddChip = (chip) => {
    setValue(value.concat([chip]))
  }

  let handleDeleteChip = (chip, index) => {
    const temp = value;
    temp.splice(index, 1)
    setValue(temp)
  }

  return (
    <Autosuggest
      theme={{
        container: classes.container,
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion
      }}
      renderInputComponent={renderInput}
      suggestions={props.tagState.tagList}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={handleSuggestionsClearRequested}
      renderSuggestionsContainer={renderSuggestionsContainer}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={(e, { suggestionValue }) => { handleAddChip(suggestionValue); e.preventDefault() }}
      focusInputOnSuggestionClick
      inputProps={{
        classes,
        chips: value,
        onChange: handletextFieldInputChange,
        value: textFieldInput,
        onAdd: (chip) => handleAddChip(chip),
        onDelete: (chip, index) => handleDeleteChip(chip, index),
        ...rest
      }}
    />
  )
}


export default connect(
  state => ({
    tagState: state.tags
  }),
  dispatch => ({
    tagDispatch: dispatch.tags
  }),
)(TreeTags)
