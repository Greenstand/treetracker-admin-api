import React, { Component } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

class TreeDetails extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    let { tree } = this.props;
    const treeImage = (tree.imageUrl !== null) ? <img className="tree-image" src={tree.imageUrl}></img> : null;
    const isAlive = (tree.causeOfDeathId !== null) ? 'Dead' : 'Alive';
    const treeMissing = (tree.missing) ? 'True' : 'False';
    return (
      <div className="tree-panel">
        {treeImage}
        <p className="tree-location">Location: {tree.lat} {tree.lon}</p>
        <p className="tree-dead">Status: {isAlive}</p>
        <p className="tree-missing">Missing: {treeMissing}</p>
      </div>
    )
  }
}

const mapState = state => {
  const keys = Object.keys(state.trees.data)
  return {
    tree: state.trees.tree,
  }
}

export default TreeDetails;
