import React from 'react'
import ChipInput from 'material-ui-chip-input'
import { connect } from 'react-redux'

const TreeTags = (props) => {
  /* load species list when mount*/
  React.useEffect(() => {
    props.tagDispatch.loadTagList()
  }, [])

  return(
    <ChipInput
      dataSource={props.tagState.tagList}
      dataSourceConfig={{text:'value', value:'value'}}
      onChange={(tags) => props.tagDispatch.onChange(tags)}
      variant='outlined'
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
