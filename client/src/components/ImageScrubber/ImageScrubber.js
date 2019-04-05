import React, { Component } from 'react'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button' // replace with icons down the line
import Infinite from 'react-infinite'

import { selectedHighlightColor } from '../../common/variables.js'
import TreeImageCard from '../TreeImageCard/TreeImageCard'

const styles = theme => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '2rem'
  },
  cardImg: {
    width: '100%',
    height: 'auto'
  },
  cardTitle: {
    color: '#f00'
  },
  card: {
    cursor: 'pointer',
    margin: '0.5rem',
    border: `2px #eee solid`
  },
  selected: {
    border: `2px ${selectedHighlightColor} solid`
  },
  cardMedia: {
    height: '12rem'
  },
  cardWrapper: {
    width: '33.33%',
  }
})

const scroll = {
  containerHeight: 1017,
  elementHeight: 295
}

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

  render() {
    const {
      numSelected,
      classes,
      rowsPerPage,
      selected,
      order,
      orderBy,
      treesArray,
      getLocationName,
      treeCount,
      byId,
      tree,
      toggleSelection
    } = this.props
    return (
      <Infinite
          containerHeight={scroll.containerHeight}
          elementHeight={scroll.elementHeight}
          useWindowAsScrollContainer={true}
          >
        <div className={classes.wrapper}>
          {this.props.treesArray.map(tree => {
            if (tree.imageUrl) {
              return (
                <TreeImageCard tree={tree} />
              )
            }
          })
          }
        </div>
      </Infinite>
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
  getLocationName: (id, lat, lon) => dispatch.imageScrubber.getLocationName({ id: id, latitude: lat, longitude: lon }),
  getTreeAsync: (id) => dispatch.imageScrubber.getTreeAsync(id),
})

export default compose(
  withStyles(styles, { withTheme: true, name: 'ImageScrubber' }),
  connect(mapState, mapDispatch)
)(ImageScrubber)
