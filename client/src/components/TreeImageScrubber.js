import React, { useRef, useState, useEffect, useReducer } from 'react'
import {
  getTreeImages,
  approveTreeImage,
  rejectTreeImage
} from '../api/treeTrackerApi'

import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button' // replace with icons down the line
import { selectedHighlightColor } from '../common/variables.js'
import Grid		from '@material-ui/core/Grid'
import IconFilter		from '@material-ui/icons/FilterList'
import IconButton		from '@material-ui/core/IconButton'
import Filter, {FILTER_WIDTH}		from './Filter'
import FilterModel		from '../models/Filter'

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
  }
})

const initialState = {
  treeImages: [],
  isLoading: false,
  pagesLoaded: -1,
  moreTreeImagesAvailable: true,
  pageSize: 20,
	/*
	 * The default value means: image not approved yet, and not rejected yet too
	 */
	filter		: new FilterModel({
		approved		: false,
		active		: true,
	}),
};

const reducer = (state, action) => {
  let treeImages = {}
  switch (action.type) {
    case 'loadMoreTreeImages':
			/*
			 * REVISE Thu Aug  1 09:12:44 CST 2019
			 * if API return empty array, then, no more tree, set the flag
			 */
			if(action.treeImages && action.treeImages.length > 0){
				let newTreeImages = [...state.treeImages, ...action.treeImages]
				let newState = {
					...state,
					treeImages: newTreeImages,
					isLoading: action.isLoading
				};
				return newState;
			}else{
				let newState = {
					...state,
					isLoading: action.isLoading,
					moreTreeImagesAvailable: false
				};
				return newState;
			}
    case "noMoreTreeImages":
      return {
        ...state,
        isLoading: false,
        moreTreeImagesAvailable: false
      };
    case "approveTreeImage":
//      treeImages = state.treeImages.filter(
//        treeImage => treeImage.id !== action.id
//      )
			//REVISE update the image approved status, and filter by 'filter' model
			state.treeImages.forEach(treeImage => {
				if(treeImage.id === action.id){
					treeImage.approved		= true
					treeImage.active		= true
				}
			})
			treeImages		= state.treeImages.filter(state.filter.filter)
      return { ...state, treeImages: treeImages }
    case 'rejectTreeImage':
//      treeImages = state.treeImages.filter(
//        treeImage => treeImage.id !== action.id
//      )
			state.treeImages.forEach(treeImage => {
				if(treeImage.id === action.id){
					treeImage.approved		= false
					treeImage.active		= false
				}
			})
			treeImages		= state.treeImages.filter(state.filter.filter)
      return { ...state, treeImages: treeImages }
		//to reset/reload the list
		case 'reset' :{
			return {
				...initialState, 
				filter: action.filter, 
			}
		}
    default:
      throw new Error('the actions got messed up, somehow!')
  }
}

const TreeImageScrubber = ({ classes, getScrollContainerRef, ...props }) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState })
	const [isFilterShown, setFilterShown]		= useState(false)
	const isLoadingRef		= useRef(state.isLoading)

  let treeImages = state.treeImages;
  let scrollContainerRef;
  const onApproveTreeImageClick = (e, id) => {
    approveTreeImage(id)
      .then(result => {
        dispatch({ type: 'approveTreeImage', id})
      })
      .catch(e => {
        // don't change the state if the server couldnt help us
        alert("Couldn't approve Tree Image: " + id + '!', e)
      })
  }

  const onRejectTreeImageClick = (e, id) => {
    rejectTreeImage(id)
      .then(result => {
        dispatch({ type: 'rejectTreeImage', id})
      })
      .catch(e => {
        // don't change the state if the server couldnt help us
        alert("Couldn't reject Tree Image: " + id + '!', e)
      })
  }

  const needtoLoadMoreTreeImages = () => {
    return state.moreTreeImagesAvailable && treeImages.length < state.pageSize;
  };

  const loadMoreTreeImages = () => {
    if (isLoadingRef.current || !state.moreTreeImagesAvailable){
			console.warn('cancel load images')
			return;
		}
		isLoadingRef.current		= true
    const nextPage = state.pagesLoaded + 1;
    const pageParams = {
      page: nextPage,
      rowsPerPage: state.pageSize,
			filter		: state.filter,
    }
		console.error('call load more with filter:%o', state.filter)
    getTreeImages(pageParams)
      .then(result => {
        state.pagesLoaded = nextPage;
        dispatch({
          type: "loadMoreTreeImages",
          treeImages: result,
          isLoading: false
        });
      })
      .catch(error => {
        // no more to load!
				console.error('no more')
        dispatch({ type: "noMoreTreeImages" });
      });
  };

  const handleScroll = e => {
    if (
      isLoadingRef.current ||
      (scrollContainerRef &&
        Math.floor(scrollContainerRef.scrollTop) !==
          Math.floor(scrollContainerRef.scrollHeight) -
            Math.floor(scrollContainerRef.offsetHeight))
    ) {
      return
    }
		console.error('load fire by scroll')
    loadMoreTreeImages()
  }


  useEffect(() => {
		//move add listener to effect to let it refresh at every state change
		scrollContainerRef = getScrollContainerRef();
		if (scrollContainerRef) {
			console.error('add scroll listener')
			scrollContainerRef.addEventListener("scroll", handleScroll);
		}

		//update isLoading
		isLoadingRef.current		= state.isLoading

		console.error('effect')
    if (needtoLoadMoreTreeImages()) {
			console.error('load fire by effect')
      loadMoreTreeImages();
    }else{
			console.warn('cancel load image in effect')
		}

    return () => {
      if (scrollContainerRef) {
        scrollContainerRef.removeEventListener('scroll', handleScroll)
      }
    };
  }, [state]);

  let treeImageItems = treeImages.map(tree => {
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
                onClick={e => onRejectTreeImageClick(e, tree.id)}
								disabled={tree.active === false}
              >
                Reject
              </Button>
              <Button
                color="primary"
                size="small"
                onClick={e => onApproveTreeImageClick(e, tree.id)}
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

	function handleFilterSubmit(filter){
		//{{{
		//before reset, should remove the scroll listener
		scrollContainerRef = getScrollContainerRef();
		if (scrollContainerRef) {
			console.error('add scroll listener')
			scrollContainerRef.removeEventListener("scroll", handleScroll);
		}
		//reset
		dispatch({type:'reset', filter, })
		//}}}
	}

  return (
		<Grid container>
			<Grid item 
				style={{
					width		: isFilterShown ? `calc(100% - 72px - ${FILTER_WIDTH}px`: undefined,
				}}
			>
				<Grid container>
					<Grid item xs={12} >
						<Grid container justify='flex-end'>
							<Grid item>
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
					<Grid item xs={12} >
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
					onSubmit={handleFilterSubmit}
					filter={state.filter}
					onClose={handleFilterClick}
				/>
			</Grid>
		</Grid>
	)
}

export default compose(
  withStyles(styles, { withTheme: true, name: 'ImageScrubber' })
)(TreeImageScrubber)
