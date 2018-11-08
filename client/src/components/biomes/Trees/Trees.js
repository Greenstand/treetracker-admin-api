/*
Trees

Trees is a contaier component (no visual representation of it's own and concerned with
handling the comms between the tree view components and the store/models)

*/
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import TableToolbar from '../../molecules/TableToolbar/TableToolbar'
import TreeTable from '../../organisms/TreeTable/TreeTable'

const Trees = (props) => ({

  render() {
    // console.log('| Tree | render | props » |', props)
    return (
      <div className="trees">
        <TableToolbar />
        <TreeTable />
      </div>
    )
  }
})

const mapState = (state) => {
  return { state: state }
}

const mapDispatch = dispatch => {
  return {
  }
}

Trees.propTypes = {
}

export default connect(mapState, mapDispatch)(Trees)
