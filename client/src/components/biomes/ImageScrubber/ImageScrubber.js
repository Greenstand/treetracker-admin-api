/*
PictureScrubber

A handy tool for quickly flagging bad images

*/
import React, { Component } from 'react'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import TreeImageCard from '../../molecules/TreeImageCard/TreeImageCard'


const styles = theme => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  }
})

class ImageScrubber extends Component {

  componentDidMount() {
    const payload = {
      page: this.props.page,
      rowsPerPage: this.props.rowsPerPage,
      order: this.props.order,
      orderBy: this.props.orderBy
    }
    this.props.getTreesWithImagesAsync(payload)
  }

  handleSelection = (e) => {}

  render() {
    const { numSelected, classes, rowsPerPage, selected, order, orderBy, treesArray, getLocationName, treeCount, byId, tree } = this.props
    return (
      <section className={classes.wrapper}>
        {this.props.treesArray.map(tree => {
          if (tree.imageUrl) {
            return (
              <TreeImageCard tree={tree}></TreeImageCard>
            )
          }
        })}
      </section>
    )
  }
}

const mapState = state => {
  const keys = Object.keys(state.trees.data)
  return {
    treesArray: keys.map(id => ({
      ...state.trees.data[id]
    })),
    page: state.trees.page,
    rowsPerPage: state.trees.rowsPerPage,
    selected: state.trees.selected,
    order: state.trees.order,
    orderBy: state.trees.orderBy,
    numSelected: state.trees.selected.length,
    byId: state.trees.byId,
    tree: state.trees.tree
  }
}

const mapDispatch = (dispatch) => ({
  getTreesWithImagesAsync: ({ page, rowsPerPage, order, orderBy }) => dispatch.trees.getTreesWithImagesAsync({ page: page, rowsPerPage: rowsPerPage, order: order, orderBy: orderBy }),
  getLocationName: (id, lat, lon) => dispatch.trees.getLocationName({ id: id, latitude: lat, longitude: lon }),
  markInactiveTree: (id) => dispatch.trees.markInactiveTree(id),
  getTreeAsync: (id) => dispatch.trees.getTreeAsync(id)
})

export default compose(
  withStyles(styles, { withTheme: true, name: 'ImageScrubber' }),
  connect(mapState, mapDispatch)
)(ImageScrubber)
