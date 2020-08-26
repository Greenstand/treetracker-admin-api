import React from 'react'
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
import CategoryIcon from '@material-ui/icons/Category'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import HomeIcon from '@material-ui/icons/Home'
import ListItemText from '@material-ui/core/ListItemText'
import Box from '@material-ui/core/Box'
import { useTheme } from '@material-ui/styles'
import IconLogo from '../IconLogo'
import { AppContext } from '../Context'
import { PERMISSIONS, hasPermission } from '../../models/auth'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'

export const MENU_WIDTH = 232

const POLICIES = {
  SUPER_PERMISSION: 'super_permission',
  LIST_USER: 'list_user',
  MANAGER_USER: 'manager_user',
  LIST_TREE: 'list_tree',
  APPROVE_TREE: 'approve_tree',
  LIST_PLANTER: 'list_planter',
  MANAGE_PLANTER: 'manage_planter',
};

const useStyles = makeStyles((theme) => ({
  drawer: {},
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
  linkItemText: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
}))

export default function GSMenu(props) {
  const classes = useStyles()
  const theme = useTheme()
  const appContext = React.useContext(AppContext)
  const { user } = appContext
  console.log("user:", user);

  const menus = [
    {
      name: 'Home',
      linkTo: '/',
      icon: HomeIcon,
      disabled: false,
    },
    {
      name: 'Monitor',
      linkTo: '/',
      icon: IconShowChart,
      disabled: true,
    },
    {
      name: 'Verify',
      linkTo: 'verify',
      icon: IconThumbsUpDown,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_TREE,
          POLICIES.APPROVE_TREE,
        ]),
    },
    {
      name: 'Trees',
      linkTo: '/trees',
      icon: IconNature,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_TREE,
          
        ]),
    },
    {
      name: 'Planters',
      linkTo: 'planters',
      icon: IconGroup,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_PLANTER,
          
        ]),
    },
    {
      name: 'Payments',
      linkTo: '/',
      icon: IconCompareArrows,
      disabled: true,
    },
    {
      name: 'Species',
      linkTo: '/species',
      icon: CategoryIcon,
      //TODO this is temporarily, need to add species policy
      disabled: 
        (!hasPermission(user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_TREE,
        ])) || user.policy.organization !== undefined,
    },
    {
      name: 'Settings',
      linkTo: '/',
      icon: IconSettings,
      disabled: true,
    },
    {
      name: 'User Manager',
      linkTo: '/usermanager',
      icon: IconGroup,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
        ]),
    },
    {
      name: 'Account',
      linkTo: '/account',
      icon: IconPermIdentity,
      disabled: false,
    },
  ]
  const menu = (
    <>
      <Box p={4}>
        <IconLogo />
      </Box>
      <Box height={20} />
      {menus.map((item, i) => (
          <Link className={classes.linkItemText} to={`${item.linkTo}`}>
            <MenuItem
              key={i}
              className={classes.menuItem}
              selected={props.active === item.name}
              disabled={item.disabled}
            >
                <Grid container>
                  <Grid item>
                    <ListItemIcon className={classes.listItemIcon}>
                      {item.icon && <item.icon />}
                    </ListItemIcon>
                  </Grid>
                  <Grid item>
                    <ListItemText className={classes.listItemText}>{item.name}</ListItemText>
                  </Grid>
                </Grid>
            </MenuItem>
          </Link>
      ))}
    </>
  )

  return props.variant === 'plain' ? (
    <>{menu}</>
  ) : (
    <Drawer
      PaperProps={{
        elevation: 5,
      }}
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      onClose={props.onClose}
      open={true}
    >
      {menu}
    </Drawer>
  )
}
