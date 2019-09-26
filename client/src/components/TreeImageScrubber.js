import React, { useEffect, useReducer } from 'react'
import clsx		from 'clsx';
import {connect}		from 'react-redux'
import compose from 'recompose/compose'
import { makeStyles} from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button' // replace with icons down the line
import { selectedHighlightColor } from '../common/variables.js';
import * as loglevel from 'loglevel';
import Grid		from '@material-ui/core/Grid';
import AppBar		from '@material-ui/core/AppBar';
import Modal		from '@material-ui/core/Modal';
import LinearProgress		from '@material-ui/core/LinearProgress';
import Filter, {FILTER_WIDTH}		from './Filter';
import FilterModel		from '../models/Filter';
import IconFilter		from '@material-ui/icons/FilterList';
import IconButton		from '@material-ui/core/IconButton';
import {MENU_WIDTH}		from './common/Menu';
import Box		from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';

const log = require('loglevel').getLogger('../components/TreeImageScrubber')

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(2, 16, 16, 16),
		userSelect		: 'none',
  },
  cardImg: {
    width: '100%',
    height: 'auto'
  },
  cardTitle: {
    color: '#f00'
  },
  card: {
    cursor: 'pointer',
    margin: '0.5rem',
  },
	cardSelected		: {
		backgroundColor		: theme.palette.action.selected,
	},
	cardContent		: {
		padding		: 0,
	},
  selected: {
    border: `2px ${selectedHighlightColor} solid`
  },
  cardMedia: {
    height: '12rem'
  },
  cardWrapper: {
    width: '33.33%',
		minWidth		: 300,
  },
	title		: {
		padding		: theme.spacing(2, 16),
	},
	snackbar		: {
		bottom		: 20,
	},
	snackbarContent		: {
		backgroundColor		: theme.palette.action.active,
	},
}))

const TreeImageScrubber = ({getScrollContainerRef, ...props }) => {
	log.debug('render TreeImageScrubber...')
	log.debug('complete:', props.verityState.approveAllComplete)
	const classes		= useStyles(props);
	const [complete, setComplete]		= React.useState(0)
	const [isFilterShown, setFilterShown]		= React.useState(false)
	
	/*
	 * effect to load page when mounted
	 */
	useEffect(() => {
		log.debug('mounted')
		props.verityDispatch.loadMoreTreeImages();
	}, [])

	/*
	 * effect to set the scroll event
	 */
	useEffect(() => {
		log.debug('verity state changed')
		//move add listener to effect to let it refresh at every state change
		let scrollContainerRef = getScrollContainerRef();
		const handleScroll = e => {
			if (
				scrollContainerRef &&
				Math.floor(scrollContainerRef.scrollTop) !==
					Math.floor(scrollContainerRef.scrollHeight) -
					Math.floor(scrollContainerRef.offsetHeight)
			) {
				return
			}
			props.verityDispatch.loadMoreTreeImages()
		}
		let isListenerAttached		= false
		if (
			scrollContainerRef &&
			//should not listen scroll when loading
			!props.verityState.isLoading
		) {
			log.debug('attaching listener')
			scrollContainerRef.addEventListener("scroll", handleScroll);
			isListenerAttached		= true
		}else{
			log.debug('do not attach listener')
		}

		return () => {
			if (isListenerAttached) {
				scrollContainerRef.removeEventListener('scroll', handleScroll)
			}
		}
	}, [props.verityState])

	/* to display progress */
	useEffect(() => {
		setComplete(props.verityState.approveAllComplete)
	},[props.verityState.approveAllComplete])

	function handleTreeClick(e, treeId){
		//{{{
		e.stopPropagation()
		e.preventDefault()
		log.debug('click at tree:%d', treeId)
		props.verityDispatch.clickTree({
			treeId,
			isShift		: e.shiftKey,
		})
		//}}}
	}

  let treeImageItems = props.verityState.treeImages.map(tree => {
    if (tree.imageUrl) {
      return (
				<div className={classes.cardWrapper} key={tree.id}>
					<Card 
						onClick={e => handleTreeClick(e, tree.id)}
						id={`card_${tree.id}`} 
						className={
							clsx(
								classes.card,
								props.verityState.treeImagesSelected.indexOf(tree.id) >= 0 ?
									classes.cardSelected
									:
									undefined
							)
						} 
						elevation={3} >
						<CardContent
							className={classes.cardContent}
						>
							<CardMedia className={classes.cardMedia} image={tree.imageUrl} />
							<Typography variant='body2' gutterBottom>Tree# {tree.id}</Typography>
						</CardContent>
						<CardActions>
							<Button
								color="secondary"
								size="small"
								onClick={e => {
									e.stopPropagation()
									e.preventDefault()
									props.verityDispatch.rejectTreeImage(tree.id)
										.then(() => {
											//after approve/reject, clear selection
											props.verityDispatch.resetSelection()
											//when finished, check if the list is empty, if true,
											//load more tree
											//why 1? because it is old state in hook
											if(props.verityState.treeImages.length === 1){
												log.debug('empty, load more')
												props.verityDispatch.loadMoreTreeImages();
											}else{
												log.trace('not empty')
											}
										})
								}}
								disabled={tree.active === false}
							>
								Reject
							</Button>
							<Button
								color="primary"
								size="small"
								onClick={e => {
									e.stopPropagation()
									e.preventDefault()
									props.verityDispatch.approveTreeImage(tree.id)
										.then(() => {
											//after approve/reject, clear selection
											props.verityDispatch.resetSelection()
											//when finished, check if the list is empty, if true,
											//load more tree
											//why 1? because it is old state in hook
											if(props.verityState.treeImages.length === 1){
												log.debug('empty, load more')
												props.verityDispatch.loadMoreTreeImages();
											}else{
												log.trace('not empty', props.verityState.treeImages.length)
											}
										})
								}}
								disabled={tree.approved === true}
							>
								Approve
							</Button>
						</CardActions>
					</Card>
				</div>
      )
    }
  })

	function handleFilterClick(){
		//{{{
		if(isFilterShown){
			setFilterShown(false)
		}else{
			setFilterShown(true)
		}
		//}}}
	}

  return (
		<React.Fragment>
			<Grid container>
				<Grid item 
					style={{
						width		: isFilterShown ? 
							`calc(100vw - ${MENU_WIDTH}px - ${FILTER_WIDTH}px`
							: 
							'100%',
					}}
				>
					<Grid container>
						<Grid 
							item
							style={{
								width		: '100%',
							}}
						>
							<Grid 
								container
								justify={'space-between'}
								className={classes.title}
							>
								<Grid item>
									<Typography variant='h5' 
										style={{
											paddingTop		: 20,
										}}
									>
										trees to verify
									</Typography>
								</Grid>
								<Grid 
									item
								>
									{/* close select all function 
									<FormControlLabel 
										control={
											<Checkbox 
												color='primary'
												checked={
													props.verityState.treeImages.length > 0 && 
													props.verityState.treeImagesSelected.length ===
													props.verityState.treeImages.length
												}
												onClick={() => {
														props.verityDispatch.selectAll(
															props.verityState.treeImagesSelected.length !==
															props.verityState.treeImages.length
														)
												}}
											/>
										} 
										label="Select All" 
									/>
									*/}
									<Button 
										style={{
											margin		: 15,
										}}
										color='primary'
										disabled={props.verityState.treeImagesSelected.length <= 0}
										onClick={async () => {
											if(window.confirm(
												`Are you sure to approve these ${props.verityState.treeImagesSelected.length} trees?`
											)){
												const result		= await props.verityDispatch.approveAll()
												if(result){
													//if all trees were approved, then, load more
													if(
														props.verityState.treeImagesSelected.length ===
														props.verityState.treeImages.length
													){
														log.debug('all trees approved, reload')
														props.verityDispatch.loadMoreTreeImages()
													}
												}else{
													window.alert('sorry, failed to approve some picture')
												}
											}
										}}>
										Approve all 
											{props.verityState.treeImagesSelected.length > 0 ?
												` ${props.verityState.treeImagesSelected.length} trees`
												:
												''
											}
									</Button>
									<IconButton
										onClick={handleFilterClick}
										style={{
											marginTop		: 8,
											marginRight		: 16,
										}}
									>
										<IconFilter/>
									</IconButton>
								</Grid>
							</Grid>
						</Grid>
						<Grid 
							item
							style={{
								width		: '100%',
							}}
						>
							<section className={classes.wrapper}>{treeImageItems}</section>
						</Grid>
					</Grid>
				</Grid>
				<Grid item 
					style={{
						width		: `${FILTER_WIDTH}px`,
					}}
				>
					<Filter 
						isOpen={isFilterShown} 
						onSubmit={(filter) => {
							props.verityDispatch.updateFilter(filter)
						}}
						filter={props.verityState.filter}
						onClose={handleFilterClick}
					/>
				</Grid>
			</Grid>
			{props.verityState.isApproveAllProcessing &&
				<AppBar
					position='fixed'
					style={{
						zIndex		: 10000,
					}}
				>
					<LinearProgress
						color='primary'
						variant='determinate'
						value={complete}
					/>
				</AppBar>
			}
			{props.verityState.isApproveAllProcessing &&
				<Modal open={true}>
					<div></div>
				</Modal>
			}
			{!props.verityState.isApproveAllProcessing &&
					props.verityState.treeImagesUndo.length > 0 &&
				<Snackbar
					open
					autoHideDuration={15000}
					ContentProps={{
						className		: classes.snackbarContent,
						'aria-describedby': 'snackbar-fab-message-id',
					}}
					message={
						<span id="snackbar-fab-message-id">
							You have approved {props.verityState.treeImagesUndo.length} trees
						</span>
					}
					color='primary'
					action={
						<Button 
							color="inherit" size="small"
							onClick={async () => {
								const result		= await props.verityDispatch.undoAll()
								log.log('finished')
							}}
						>
							Undo
						</Button>
					}
					className={classes.snackbar}
				/>
			}
		</React.Fragment>
	)
}

export default connect(
	//state
	state		=> ({
		verityState		: state.verity,
	}),
	//dispatch
	dispatch		=> ({
		verityDispatch		: dispatch.verity,
	}),
)(TreeImageScrubber) 
