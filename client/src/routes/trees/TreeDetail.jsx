import React from 'react'

const TreeDetail = (props) => {
  let { tree } = props || {
    tree: {
      imageUrl: null,
      causeOfDeathId: null,
      missing: 'True',
      lat: 45.45,
      lon: 45.45,
    },
  }
  const treeImage =
    tree.imageUrl !== null ? (
      <img className="tree-image" src={tree.imageUrl} alt="tree-image" />
    ) : null
  const isAlive = tree.causeOfDeathId !== null ? 'Dead' : 'Alive'
  const treeMissing = tree.missing ? 'True' : 'False'
  return (
    <div className="tree-panel">
      {treeImage}
      <p className="tree-location">
        Location: {tree.lat} {tree.lon}
      </p>
      <p className="tree-dead">Status: {isAlive}</p>
      <p className="tree-missing">Missing: {treeMissing}</p>
    </div>
  )
}

export default TreeDetail
