import React		from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Drawer		from '@material-ui/core/Drawer';
import Paper		from '@material-ui/core/Paper';
import Menu		from '@material-ui/core/Menu';
import MenuItem		from '@material-ui/core/MenuItem';
import IconSettings		from '@material-ui/icons/Settings';
import IconShowChart	from '@material-ui/icons/ShowChart';
import IconThumbsUpDown		from '@material-ui/icons/ThumbsUpDown';
import IconNature		from '@material-ui/icons/Nature';
import IconGroup		from '@material-ui/icons/Group';
import IconCompareArrows		from'@material-ui/icons/CompareArrows';
import IconPermIdentity		from '@material-ui/icons/PermIdentity';
import ListItemIcon		from '@material-ui/core/ListItemIcon';
import ListItemText		from '@material-ui/core/ListItemText';
import Box		from '@material-ui/core/Box';
import {useTheme, }		from '@material-ui/styles';
import IconLogo		from '../IconLogo';
import {AppContext} from "../MainFrame";
import {PERMISSIONS, hasPermission} from "../../models/auth";

export const MENU_WIDTH		= 232

const useStyles		= makeStyles(theme => ({
	drawer		: {
	},
	drawerPaper		: {
		width		: MENU_WIDTH,
		position		: 'inherit',
		height		: '100vh',
	},
	menuItem		: {
		'&:hover'		: {
			backgroundColor		: theme.palette.primary.lightVery,
			'& .MuiListItemIcon-root, & .MuiListItemText-primary'		: {
				color		: theme.palette.primary.main,
			},
			'& .MuiListItemIcon-root'		: {
				color		: theme.palette.primary.main,
			},
		},
		borderTopRightRadius		: 25,
		borderBottomRightRadius		: 25,
		marginRight		: 35,
		'&.Mui-selected'		: {
			color		: theme.palette.primary.main,
			fontWeight		: 400,
			backgroundColor		: theme.palette.action.hover,
		},
		'&.Mui-selected .MuiListItemIcon-root'		: {
			color		: theme.palette.primary.main,
		},
	},
	listItemIcon		: {
		minWidth		: 46,
	},
	listItemText		: {
		'& .MuiTypography-body1'		: {
			fontWeight		: 700,
		},
	},
}))


export default function GSMenu(props){
	const classes		= useStyles()
	const theme		= useTheme()
  const appContext = React.useContext(AppContext);
  const { user} = appContext;

  const menus		= [
    {
      name		: 'Monitor',
      icon		: IconShowChart,
      disabled		: true,
    },{
      name		: 'Verify',
      icon		: IconThumbsUpDown,
      disabled		: !hasPermission(user,PERMISSIONS.TREE_AUDIT),
    },{
      name		: 'Trees',
      icon		: IconNature,
      disabled		: !hasPermission(user,PERMISSIONS.TREE_AUDIT),
    },{
      name		: 'Planters',
      icon		: IconGroup,
      disabled		: !hasPermission(user,PERMISSIONS.PLANTER),
    },{
      name		: 'Payments',
      icon		: IconCompareArrows,
      disabled		: true,
    },{
      name		: 'Settings',
      icon		: IconSettings,
      disabled		: true,
    },{
      name		: 'User Manager',
      icon		: IconGroup,
      disabled		: !hasPermission(user,PERMISSIONS.ADMIN),
    },{
      name		: 'Account',
      icon		: IconPermIdentity,
      disabled		: false,
    }
  ]
  const menu = 
      <>
				<Box p={4} >
					<IconLogo/>
				</Box>
				<Box height={20} />
				{menus.map((item,i) => (
					<MenuItem
            key={i}
						className={classes.menuItem}
						selected={props.active === item.name}
						onClick={() => appContext.handleMenuChange(item.name)}
						disabled={item.disabled}
					>
						<ListItemIcon
							className={classes.listItemIcon}
						>
							{item.icon && <item.icon/>}
						</ListItemIcon>
						<ListItemText
							className={classes.listItemText}
						>
							{item.name}
						</ListItemText>
					</MenuItem>
				))}
      </>;

	return(
    props.variant === "plain"?
      <>
        {menu}
      </>
    :
			<Drawer
				PaperProps={{
					elevation		: 5,
				}}
				className={classes.drawer}
				classes={{paper:classes.drawerPaper}}
        onClose={props.onClose}
        open={true}
			>
        {menu}
			</Drawer>
	)
}
