import React		from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Drawer		from '@material-ui/core/Drawer';
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

const useStyles		= makeStyles(theme => ({
	drawer		: {
	},
	drawerPaper		: {
		width		: 232,
		position		: 'inherit',
		height		: '100vh',
	},
	menuItem		: {
		'&:hover'		: {
			backgroundColor		: theme.palette.primary.lightVery,
			'& .MuiListItemIcon-root, & .MuiListItemText-primary'		: {
				color		: theme.palette.primary.main,
			},
		},
		borderTopRightRadius		: 25,
		borderBottomRightRadius		: 25,
		marginRight		: 35,
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

export default function GSMenu(){
	const classes		= useStyles()
	const theme		= useTheme()
	console.error('theme primary:', theme.palette.primary.light)
	const menus		= [
		{
			name		: 'Monitor',
			icon		: IconShowChart,
		},{
			name		: 'Verify',
			icon		: IconThumbsUpDown,
		},{
			name		: 'Trees',
			icon		: IconNature,
		},{
			name		: 'Planters',
			icon		: IconGroup,
		},{
			name		: 'Payments',
			icon		: IconCompareArrows,
		},{
			name		: 'Settings',
			icon		: IconSettings,
		},{
			name		: 'Account',
			icon		: IconPermIdentity,
		}
	]
	return(
			<Drawer
				variant='permanent'
				PaperProps={{
					elevation		: 5,
				}}
				className={classes.drawer}
				classes={{paper:classes.drawerPaper}}
			>
				<Box p={4} >
					<IconLogo/>
				</Box>
				<Box height={20} />
				{menus.map(item => (
					<MenuItem
						className={classes.menuItem}
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
			</Drawer>
	)
}
