import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import Typography from '@material-ui/core/Typography'
import FilterListIcon from '@material-ui/icons/FilterList';

let TableToolbar = props => {
  const { selected, numSelected, classes } = props
  let counter = 0
  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subheading">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="title" id="tableTitle">
            Trees
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton aria-label="Filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  );
};

TableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired
};


const styles = theme => ({
  root: {
    width: '100%',
    paddingTop: theme.spacing.unit * 3,
    position: 'fixed',
    top: '64px',
    backgroundColor: '#dedede',
    zIndex: 102
  },

  tableWrapper: {
    overflowX: 'auto',
  }
})

const mapState = state => {
  return {
    selected: state.trees.selected,
    numSelected: state.trees.length
  }
}

const mapDispatch = dispatch => {
  return {
    dispatch
  }
}

TableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
}

export default compose(
  withStyles(styles, { withTheme: true, name: 'TableToolbar' }),
  connect(mapState, mapDispatch)
)(TableToolbar)
