import React, {useState} from 'react'
import Drawer from '@material-ui/core/Drawer';
import compose from 'recompose/compose'
import {withStyles} from '@material-ui/core/styles'
import Grid		from '@material-ui/core/Grid'
import IconButton		from '@material-ui/core/IconButton'
import Button		from '@material-ui/core/Button'
import IconClose		from '@material-ui/icons/CloseRounded'
import Typography		from '@material-ui/core/Typography'
import TextField		from '@material-ui/core/TextField'
import MenuItem		from '@material-ui/core/MenuItem'
import FilledInput		from '@material-ui/core/FilledInput';
import FormControl		from '@material-ui/core/FormControl';
import FormHelperText		from '@material-ui/core/FormHelperText';
import Input		from '@material-ui/core/Input';
import InputLabel		from '@material-ui/core/InputLabel';
import OutlinedInput		from '@material-ui/core/OutlinedInput';
import FilterModel		from '../models/Filter'
import dateformat		from 'dateformat'

export const drawWidth		= 330

const styles = theme => {
	return {
	root		: {
	},
	drawer: {
		flexShrink: 0,
	},
	drawerPaper: {
		marginTop		: 64,
		width: drawWidth,
		paddingTop		: theme.spacing.unit * 3,
		paddingLeft		: theme.spacing.unit * 2,
		paddingRight		: theme.spacing.unit * 2,
		/*
		 * boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
		 * */
	},
	close		: {
		color		: theme.palette.grey[500],
	},
	dateInput		: {
		width		: 158,
		fontSize		: 14,
	},
}}

function Filter(props){

	const {classes, filter}		= props
	console.error('filter:%o', filter)
	const dateStartDefault		= '1970-01-01'
	const dateEndDefault		= `${dateformat(Date.now(), 'yyyy-mm-dd')}`
	const [treeId, setTreeId]		= useState(filter.treeId)
	const [status, setStatus]		= useState(filter.status)
	const [dateStart, setDateStart]		= useState(filter.dateStart || dateStartDefault)
	const [dateEnd, setDateEnd]		= useState(filter.dateEnd || dateEndDefault)
	console.error('the tree id:%d', treeId)

	function handleDateStartChange(e){
		setDateStart(e.target.value || dateStartDefault)
	}

	function handleDateEndChange(e){
		setDateEnd(e.target.value || dateEndDefault)
	}

	function handleSubmit(){
		const filter		= new FilterModel()
		filter.treeId		= treeId
		filter.status		= status
		filter.dateStart		= dateStart
		filter.dateEnd		= dateEnd
		props.onSubmit && props.onSubmit(filter)
	}

	return (
		<Drawer
			className={classes.drawer}
			classes={{
				paper: classes.drawerPaper,
			}}
			open={props.isOpen}
			variant='persistent'
			anchor='right'
			PaperProps={{
				elevation		: props.isOpen ? 6 : 0,
			}}
		>
			<Grid
				container
				justify='space-between'
			>
				<Grid item>
					<Typography variant='h6'>
						Filter
					</Typography>
				</Grid>
				<Grid item>
					<IconButton 
						color='primary' 
						classes={{
							colorPrimary		: classes.close,
						}}
					>
						<IconClose/>
					</IconButton>
				</Grid>
			</Grid>
			<Button
				variant='outlined'
				color='primary'
				onClick={handleSubmit}
			>
				Apply Filters
			</Button>
			<TextField
				variant='outlined'
				label='TREE ID'
				placeholder='e.g. 80'
				margin='normal'
				InputLabelProps={{
					shrink: true,
				}}
				value={treeId}
				onChange={e => setTreeId(e.target.value)}
			/>
			<TextField
				select
				variant='outlined'
				label='STATUS'
				placeholder='e.g. 80'
				value={status ? status : 'All'}
				margin='normal'
				InputLabelProps={{
					shrink: true,
				}}
				onChange={e => setStatus(e.target.value === 'All'? '':e.target.value)}
			>
				{['All', 'Planted', 'Hole dug', 'Not a tree', 'Blurry'].map(name =>
					<MenuItem
						key={name}
						value={name}
					>
						{name}
					</MenuItem>
				)} 
			</TextField>
			<FormControl
				variant='outlined'
				margin='normal'
			>
				<InputLabel
					shrink={true}
				>
					TIME CREATED
				</InputLabel>
				<Grid 
					container
					justify='space-between'
					style={{
						marginTop: 19,
					}}
				>
					<Grid item>
						<OutlinedInput
							type='date'
							className={classes.dateInput}
							value={dateStart}
							onChange={handleDateStartChange}
						/>
					</Grid>
					<Grid item>
						<OutlinedInput
							type='date'
							className={classes.dateInput}
							value={dateEnd}
							onChange={handleDateEndChange}
						/>
					</Grid>
				</Grid>
			</FormControl>
			
		</Drawer>
	)
}

export default compose(
  withStyles(styles, { withTheme: true, name: 'Filter' })
)(Filter)
