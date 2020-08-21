import React from 'react';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import { styled } from '@material-ui/core/styles'

const MenuBox = styled(MenuItem)({
  borderTopRightRadius: 25,
  borderBottomRightRadius: 25,
  marginRight: 35,
  pointerEvents: 'none',
});

class MenuStats extends React.PureComponent {
  async componentDidMount() {
    const {
      unprocessedTreeCount,
      totalTrees,
      planterCount,
      getTreeCount,
      getPlanterCount,
      getUnprocessedTreeCount,
    } = this.props;

    // Various counts default to 0, fetch counts only as necessary
    if (!planterCount) {
      getPlanterCount();
    }

    if (!totalTrees) {
      getTreeCount();
    }

    if (unprocessedTreeCount === null) {
      getUnprocessedTreeCount();
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      unprocessedTreeCount,
      totalTrees,
      planterCount
    } = nextProps;

    return (unprocessedTreeCount && totalTrees && planterCount) || (!unprocessedTreeCount && !totalTrees && !planterCount)
  }

  getStatsElement() {
    const {
      unprocessedTreeCount,
      totalTrees,
      planterCount
    } = this.props;

    return (<MenuBox>
      Total trees: {totalTrees}<br/>
      Unprocessed trees: {unprocessedTreeCount}<br/>
      # of Users: {planterCount}<br/>
    </MenuBox>);
  }

  render () {
    const {
      unprocessedTreeCount,
      totalTrees,
      planterCount
    } = this.props;

    if (unprocessedTreeCount !== null && totalTrees && planterCount) {
      return this.getStatsElement();
    } else {
      return <MenuBox>Loading stats...</MenuBox>;
    }
  }
}

export default connect(
  state => ({
    unprocessedTreeCount: state.verity.unprocessedTreeCount,
    totalTrees: state.trees.treeCount,
    planterCount: state.planters.count
  }),
  dispatch => ({
    getUnprocessedTreeCount: dispatch.verity.getUnprocessedTreeCount,
    getTreeCount: dispatch.trees.getTreeCount,
    getPlanterCount: dispatch.planters.count,
  })
)(MenuStats);
