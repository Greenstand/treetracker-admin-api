/*
Trees

Trees is a contaier component (no visual representation of it's own and concerned with
handling the comms between the tree view components and the store/models)

*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';

import Navbar from './Navbar';
import TreeTable from './TreeTable';

const Trees = props => ({
  render () {
    return (
      <Grid container direction="column">
        <Grid item>
          <Navbar />
        </Grid>
        <Grid item>
          <TreeTable />
        </Grid>
      </Grid>
    )
  }
})

const mapState = state => {
  return { state: state }
}

const mapDispatch = dispatch => {
  return {}
}

Trees.propTypes = {}

export default connect(
  mapState,
  mapDispatch
)(Trees)
