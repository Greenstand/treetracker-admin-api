import React, { useEffect, useReducer } from 'react'
import {connect}		from 'react-redux'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
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
import Filter, {FILTER_WIDTH}		from './Filter'
import FilterModel		from '../models/Filter'
import IconFilter		from '@material-ui/icons/FilterList'
import IconButton		from '@material-ui/core/IconButton'

const log = require('loglevel').getLogger('../components/TreeImageScrubber')

const styles = theme => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '2rem 2rem 4rem'
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
    border: `2px #eee solid`
  },
  selected: {
    border: `2px ${selectedHighlightColor} solid`
  },
  cardMedia: {
    height: '12rem'
  },
  cardWrapper: {
    width: '33.33%',
		minWidth		: 200,
  }
})


//const initialState = {
//  treeImages: [],
//  isLoading: false,
//  pagesLoaded: -1,
//  moreTreeImagesAvailable: true,
//  pageSize: 20
//};

//const reducer = (state, action) => {
//  let treeImages = {}
//  switch (action.type) {
//    case 'loadMoreTreeImages':
//      let newTreeImages = [...state.treeImages, ...action.treeImages]
//      let newState = {
//        ...state,
//        treeImages: newTreeImages,
//        isLoading: action.isLoading
//      };
//      return newState;
//    case "noMoreTreeImages":
//      return {
//        ...state,
//        isLoading: false,
//        moreTreeImagesAvailable: false
//      };
//    case "approveTreeImage":
//      treeImages = state.treeImages.filter(
//        treeImage => treeImage.id !== action.id
//      )
//      return { ...state, treeImages: treeImages }
//    case 'rejectTreeImage':
//      treeImages = state.treeImages.filter(
//        treeImage => treeImage.id !== action.id
//      )
//      return { ...state, treeImages: treeImages }
//    default:
//      throw new Error('the actions got messed up, somehow!')
//  }
//}

const TreeImageScrubber = ({ classes, getScrollContainerRef, ...props }) => {
	log.debug('render TreeImageScrubber...')
	log.debug('complete:', props.verityState.approveAllComplete)
	const [complete, setComplete]		= React.useState(0)
	const [isFilterShown, setFilterShown]		= React.useState(false)
  //const [state, dispatch] = useReducer(reducer, { ...initialState })
  //let treeImages = state.treeImages;
//  let scrollContainerRef;
//  const onApproveTreeImageClick = (e, id) => {
//    approveTreeImage(id)
//      .then(result => {
//        dispatch({ type: 'approveTreeImage', id })
//      })
//      .catch(e => {
//        // don't change the state if the server couldnt help us
//        alert("Couldn't approve Tree Image: " + id + '!', e)
//      })
//  }

//  const onRejectTreeImageClick = (e, id) => {
//    rejectTreeImage(id)
//      .then(result => {
//        dispatch({ type: 'rejectTreeImage', id })
//      })
//      .catch(e => {
//        // don't change the state if the server couldnt help us
//        alert("Couldn't reject Tree Image: " + id + '!', e)
//      })
//  }

//  const setIsLoading = loading => {
//    state.isLoading = loading
//  }

//  const needtoLoadMoreTreeImages = () => {
//    return state.moreTreeImagesAvailable && treeImages.length < state.pageSize;
//  };

//  const loadMoreTreeImages = () => {
//    if (state.isLoading || !state.moreTreeImagesAvailable) return;
//    setIsLoading(true);
//    const nextPage = state.pagesLoaded + 1;
//    const pageParams = {
//      page: nextPage,
//      rowsPerPage: state.pageSize
//    }
//    getTreeImages(pageParams)
//      .then(result => {
//        state.pagesLoaded = nextPage;
//        dispatch({
//          type: "loadMoreTreeImages",
//          treeImages: result,
//          isLoading: false
//        });
//      })
//      .catch(error => {
//        // no more to load!
//        dispatch({ type: "noMoreTreeImages" });
//      });
//  };

//  const handleScroll = e => {
//    if (
//      props.verityState.isLoading ||
//      (scrollContainerRef &&
//        Math.floor(scrollContainerRef.scrollTop) !==
//          Math.floor(scrollContainerRef.scrollHeight) -
//            Math.floor(scrollContainerRef.offsetHeight))
//    ) {
//      return
//    }
//    props.verityDispatch.loadMoreTreeImages()
//  }
//  scrollContainerRef = getScrollContainerRef();
//  if (scrollContainerRef) {
//    scrollContainerRef.addEventListener("scroll", handleScroll);
//  }

//  useEffect(() => {
//    if (needtoLoadMoreTreeImages()) {
//      loadMoreTreeImages();
//    }
//
//    return () => {
//      if (scrollContainerRef) {
//        scrollContainerRef.removeEventListener('scroll', handleScroll)
//      }
//    };
//  }, [state]);
	
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

	useEffect(() => {
		setComplete(props.verityState.approveAllComplete)
	},[props.verityState.approveAllComplete])

  let treeImageItems = props.verityState.treeImages.map(tree => {
    if (tree.imageUrl) {
      return (
				<div className={classes.cardWrapper} key={tree.id}>
					<Card id={`card_${tree.id}`} className={classes.card}>
						<CardContent>
							<CardMedia className={classes.cardMedia} image={tree.imageUrl} />
							<Typography gutterBottom>Tree# {tree.id}</Typography>
						</CardContent>
						<CardActions>
							<Button
								color="secondary"
								size="small"
								onClick={e => props.verityDispatch.rejectTreeImage(tree.id)}
								disabled={tree.active === false}
							>
								Reject
							</Button>
							<Button
								color="primary"
								size="small"
								onClick={e => props.verityDispatch.approveTreeImage(tree.id)}
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
						width		: isFilterShown ? `calc(100% - 72px - ${FILTER_WIDTH}px`: undefined,
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
								justify={'flex-end'}
							>
								<Grid 
									item
								>
									{/*
									<Button 
										style={{
											margin		: 15,
										}}
										variant='contained'
										color='primary'
										onClick={async () => {
											if(window.confirm(
												`Are you sure to approve these ${props.verityState.treeImages.length} trees?`
											)){
												const result		= await props.verityDispatch.approveAll()
												if(result){
													props.verityDispatch.loadMoreTreeImages()
												}else{
													window.alert('sorry, failed to approve some picture')
												}
											}
										}}>
										Approve all
									</Button>
									*/}
									<IconButton
										onClick={handleFilterClick}
										style={{
											marginTop		: 8,
											marginRight		: 8,
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
		</React.Fragment>
	)
}

export default compose(
	//redux
	connect(
		//state
		state		=> ({
			verityState		: state.verity,
		}),
		//dispatch
		dispatch		=> ({
			verityDispatch		: dispatch.verity,
		}),
	),
  withStyles(styles, { withTheme: true, name: 'ImageScrubber' })
)(TreeImageScrubber) 
