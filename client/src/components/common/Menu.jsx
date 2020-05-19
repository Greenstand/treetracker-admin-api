import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import MenuItem from '@material-ui/core/MenuItem'
import IconSettings from '@material-ui/icons/Settings'
import IconShowChart from '@material-ui/icons/ShowChart'
import IconThumbsUpDown from '@material-ui/icons/ThumbsUpDown'
import IconNature from '@material-ui/icons/Nature'
import IconGroup from '@material-ui/icons/Group'
import IconCompareArrows from '@material-ui/icons/CompareArrows'
import IconPermIdentity from '@material-ui/icons/PermIdentity'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Box from '@material-ui/core/Box'

import IconLogo from '../IconLogo'
import paths from '../../paths'

export const MENU_WIDTH = 232

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: MENU_WIDTH,
    position: 'inherit',
    height: '100vh',
  },
  menuItem: {
    '&:hover': {
      backgroundColor: theme.palette.primary.lightVery,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.primary.main,
      },
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
    },
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    marginRight: 35,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 400,
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-selected .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  listItemIcon: {
    minWidth: 46,
  },
  listItemText: {
    '& .MuiTypography-body1': {
      fontWeight: 700,
    },
  },
}))

const menus = [
  {
    name: 'Monitor',
    icon: IconShowChart,
    disabled: true,
    route: paths.monitor,
  },
  {
    name: 'Verify',
    icon: IconThumbsUpDown,
    disabled: false,
    route: paths.root,
  },
  {
    name: 'Trees',
    icon: IconNature,
    disabled: false,
    route: paths.trees,
  },
  {
    name: 'Planters',
    icon: IconGroup,
    disabled: true,
    route: paths.planters,
  },
  {
    name: 'Payments',
    icon: IconCompareArrows,
    disabled: true,
    route: paths.payments,
  },
  {
    name: 'Settings',
    icon: IconSettings,
    disabled: true,
    route: paths.settings,
  },
  {
    name: 'Account',
    icon: IconPermIdentity,
    disabled: true,
    route: paths.account,
  },
]

export default function Menu({ isOpen }) {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const onMenuItemClick = useCallback(
    (path) => () => {
      history.push(path)
    },
    []
  )
  return (
    <Drawer
      PaperProps={{
        elevation: 5,
      }}
      classes={{ paper: classes.drawerPaper }}
      isOpen={isOpen}
    >
      <Box p={4}>
        <IconLogo />
      </Box>
      <Box height={20} />
      {menus.map((item) => (
        <MenuItem
          key={item.route}
          className={classes.menuItem}
          onClick={onMenuItemClick(item.route)}
          selected={location.pathname === item.route}
          disabled={item.disabled}
        >
          <ListItemIcon className={classes.listItemIcon}>{item.icon && <item.icon />}</ListItemIcon>
          <ListItemText className={classes.listItemText}>{item.name}</ListItemText>
        </MenuItem>
      ))}
    </Drawer>
  )
}

Menu.propTypes = {
  isOpen: PropTypes.bool,
}
