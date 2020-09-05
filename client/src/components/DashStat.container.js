import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'

import withData from './common/withData'
import DashStat from './DashStat'
import { countToLocaleString } from '../common/numbers'
import theme from './common/theme'

import NatureOutlinedIcon from '@material-ui/icons/NatureOutlined'
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import PeopleOutlineOutlinedIcon from '@material-ui/icons/PeopleOutlineOutlined'

const DashStatWithData = withData(DashStat);

export const DashStatTotalTrees = compose(
  (El) => ((props) => (<El
    color={theme.palette.stats.green}
    Icon={NatureOutlinedIcon}
    label={'Total Trees'} {...props} />)),
  connect(
    state => ({
      data: state.trees.treeCount !== null ? countToLocaleString(state.trees.treeCount) : null,
    }),
    dispatch => ({
      fetch: dispatch.trees.getTreeCount,
    }),
  ),
)(DashStatWithData);

export const DashStatUnprocessedTrees = compose(
  (El) => ((props) => (<El
    color={theme.palette.stats.red}
    Icon={LocalOfferOutlinedIcon}
    label={'Untagged Trees'} {...props} />)),
  connect(
    state => ({
      data: state.verity.unprocessedTreeCount !== null ? countToLocaleString(state.verity.unprocessedTreeCount) : null
    }),
    dispatch => ({
      fetch: dispatch.verity.getUnprocessedTreeCount,
    })
  ),
)(DashStatWithData);

export const DashStatVerifiedTrees = compose(
  (El) => ((props) => (<El
    color={theme.palette.stats.orange}
    Icon={CheckCircleOutlineOutlinedIcon}
    label={'Verified Trees'} {...props} />)),
  connect(
    state => ({
      data: state.verity.verifiedTreeCount !== null ? countToLocaleString(state.verity.verifiedTreeCount) : null
    }),
    dispatch => ({
      fetch: dispatch.verity.getVerifiedTreeCount,
    })
  ),
)(DashStatWithData);

export const DashStatPlanterCount = compose(
  (El) => ((props) => (<El
    color={theme.palette.stats.orange}
    Icon={PeopleOutlineOutlinedIcon}
    label={'Users'} {...props} />)),
  connect(
    state => ({
      data: state.planters.count !== null ? countToLocaleString(state.planters.count) : null
    }),
    dispatch => ({
      fetch: dispatch.planters.count
    })
  ),
)(DashStatWithData);
