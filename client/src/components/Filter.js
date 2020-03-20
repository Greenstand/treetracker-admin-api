import React, { useState } from 'react'
import Drawer from '@material-ui/core/Drawer';
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/styles'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import IconClose from '@material-ui/icons/CloseRounded'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilterModel from '../models/Filter'
import dateformat from 'dateformat'
import GSInputLabel from './common/InputLabel';
import classNames from 'classnames';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';

export const FILTER_WIDTH = 330

const styles = theme => {
	return {
		root: {
		},
		filter: {
			marginBottom: theme.spacing(1),
		},
		drawer: {
			flexShrink: 0,
		},
		drawerPaper: {
			width: FILTER_WIDTH,
			padding: theme.spacing(3, 2, 2, 2),
			/*
			 * boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
			 * */
		},
		close: {
			color: theme.palette.grey[500],
		},
		dateInput: {
			width: 145,
			fontSize: 14,
		},
		endDate: {
			width: 145,
			fontSize: 14,
			marginLeft: 10,
		},
		timeCreated: {
			marginBottom: theme.spacing(2),
		},
		endTime: {
			marginLeft: theme.spacing(2),
		},
		button: {
			marginTop: theme.spacing(10),
		}
	}
}

function Filter(props) {
	console.log(styles);
	const { classes, filter } = props
	//console.error('filter:%o', filter)
	const dateStartDefault = '2020-01-01';
	const dateEndDefault = `${dateformat(Date.now(), 'yyyy-mm-dd')}`;
	const [treeId, setTreeId] = useState(filter.treeId)
	const [planterId, setPlanterId] = useState(filter.planterId)
	const [deviceId, setDeviceId] = useState(filter.deviceId)
	const [planterIdentifier, setPlanterIdentifier] = useState(filter.planterIdentifier)
	const [status, setStatus] = useState(filter.status)
	const [approved, setApproved] = useState(filter.approved)
	const [active, setActive] = useState(filter.active)
	const [dateStart, setDateStart] = useState(
		filter.dateStart || dateStartDefault
	);
	const [dateEnd, setDateEnd] = useState(filter.dateEnd || dateEndDefault);
	
	const handleDateStartChange = date => {
		console.log("日期是date： ", date);
		setDateStart(formatDate(date));
	};
	
	const handleDateEndChange = date => {
		setDateEnd(formatDate(date));
	};
	
	const formatDate = date => {
		return dateformat(date, 'yyyy-mm-dd');
	};

	function handleClear() {
		const filter = new FilterModel()
		setTreeId('')
		setPlanterId('')
		setDeviceId('')
		setPlanterIdentifier('')
		setStatus('All')
		setDateStart(dateStartDefault)
		setDateEnd(dateEndDefault)
		setApproved()
		setActive()
		props.onSubmit && props.onSubmit(filter)
	}

	function handleSubmit() {
		const filter = new FilterModel()
		filter.treeId = treeId
		filter.planterId = planterId
		filter.deviceId = deviceId
		filter.planterIdentifier = planterIdentifier
		filter.status = status
		filter.dateStart = formatDate(dateStart);
		filter.dateEnd = formatDate(dateEnd);
		filter.approved = approved
		filter.active = active
		props.onSubmit && props.onSubmit(filter)
	}

	return (
		<Grid
			container
			justify='space-between'
			className={classes.filter}
		>
			<Grid item></Grid>
			<Grid item>
				<GSInputLabel text='Status' />
				<TextField
					select
					placeholder='e.g. 80'
					value={status ? status : 'All'}
					InputLabelProps={{
						shrink: true,
					}}
					onChange={e => setStatus(e.target.value === 'All' ? '' : e.target.value)}
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
			</Grid>
			<Grid item>
				<GSInputLabel text='Approved' />
				<TextField
					select
					value={
						approved === undefined ?
							'All'
							:
							approved === true ?
								'true'
								:
								'false'}
					InputLabelProps={{
						shrink: true,
					}}
					onChange={e => setApproved(
						e.target.value === 'All' ?
							undefined
							:
							e.target.value === 'true' ?
								true
								:
								false)}
				>
					{['All', 'true', 'false',].map(name =>
						<MenuItem
							key={name}
							value={name}
						>
							{name}
						</MenuItem>
					)}
				</TextField>
			</Grid>
			<Grid item>
				<GSInputLabel text='Rejected' />
				<TextField
					select
					value={
						active === undefined ?
							'All'
							:
							active === true ?
								'false'
								:
								'true'}
					InputLabelProps={{
						shrink: true,
					}}
					onChange={e => setActive(
						e.target.value === 'All' ?
							undefined
							:
							e.target.value === 'true' ?
								false
								:
								true)}
				>
					{['All', 'false', 'true',].map(name =>
						<MenuItem
							key={name}
							value={name}
						>
							{name}
						</MenuItem>
					)}
				</TextField>
			</Grid>
			<Grid item className={classes.timeCreated}>
				<GSInputLabel text='Time created' />
				<MuiPickersUtilsProvider utils={DateFnsUtils}>
					<Grid container justify='space-between'>
					<KeyboardDatePicker
						margin='none'
						id='start-date-picker'
						label='Start Date'
						format='MM/dd/yyyy'
						value={dateStart}
						onChange={handleDateStartChange}
						KeyboardButtonProps={{
						'aria-label': 'change date'
						}}
						className={classes.dateInput}
					/>
					<KeyboardDatePicker
						margin='none'
						id='end-date-picker'
						label='End Date'
						format='MM/dd/yyyy'
						value={dateEnd}
						onChange={handleDateEndChange}
						KeyboardButtonProps={{
						'aria-label': 'change date'
						}}
						className={classes.endDate}
					/>
					</Grid>
      			</MuiPickersUtilsProvider>
			</Grid>
			<Grid item>
				<GSInputLabel text='Planter Identifier' />
				<TextField
					placeholder='planter identifier'
					InputLabelProps={{
						shrink: true,
					}}
					value={planterIdentifier}
					onChange={e => setPlanterIdentifier(e.target.value)}
				/>
			</Grid>
			<Grid item>
				<GSInputLabel text='Planter Id' />
				<TextField
					placeholder='planter id'
					InputLabelProps={{
						shrink: true,
					}}
					value={planterId}
					onChange={e => setPlanterId(e.target.value)}
				/>
			</Grid>
			<Grid item>
				<GSInputLabel text='Tree Id' />
				<TextField
					placeholder='e.g. 80'
					InputLabelProps={{
						shrink: true,
					}}
					value={treeId}
					onChange={e => setTreeId(e.target.value)}
				/>
			</Grid>
			<Grid item>
				<GSInputLabel text='Device Id' />
				<TextField
					placeholder='device id'
					InputLabelProps={{
						shrink: true,
					}}
					value={deviceId}
					onChange={e => setDeviceId(e.target.value)}
				/>
			</Grid>
			<Grid item className={classes.applyButton}>
				<Button
					variant='outlined'
					color='primary'
					onClick={handleSubmit}
					className={classes.button}
				>
					Apply
				</Button>
			</Grid>
			<Grid item></Grid>
		</Grid>
	)
}

//export default compose(
//  withStyles(styles, { withTheme: true, name: 'Filter' })
//)(Filter)
export default withStyles(styles)(Filter);
