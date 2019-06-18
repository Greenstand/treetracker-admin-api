import React, { useEffect, useReducer } from 'react'
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
    width: '33.33%'
  }
})

const initialState = {
  treeImages: [],
  isLoading: false,
  pagesLoaded: -1,
  moreTreeImagesAvailable: true,
  pageSize: 20
};

const reducer = (state, action) => {
  let treeImages = {}
  switch (action.type) {
    case 'loadMoreTreeImages':
      let newTreeImages = [...state.treeImages, ...action.treeImages]
      let newState = {
        ...state,
        treeImages: newTreeImages,
        isLoading: action.isLoading
      };
      return newState;
    case "noMoreTreeImages":
      return {
        ...state,
        isLoading: false,
        moreTreeImagesAvailable: false
      };
    case "approveTreeImage":
      treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== action.id
      )
      return { ...state, treeImages: treeImages }
    case 'rejectTreeImage':
      treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== action.id
      )
      return { ...state, treeImages: treeImages }
    default:
      throw new Error('the actions got messed up, somehow!')
  }
}

const TreeImageScrubber = ({ classes, getScrollContainerRef, ...props }) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState })
  let treeImages = state.treeImages;
  let scrollContainerRef;
  const onApproveTreeImageClick = (e, id) => {
    approveTreeImage(id)
      .then(result => {
        dispatch({ type: 'approveTreeImage', id })
      })
      .catch(e => {
        // don't change the state if the server couldnt help us
        alert("Couldn't approve Tree Image: " + id + '!', e)
      })
  }

  const onRejectTreeImageClick = (e, id) => {
    rejectTreeImage(id)
      .then(result => {
        dispatch({ type: 'rejectTreeImage', id })
      })
      .catch(e => {
        // don't change the state if the server couldnt help us
        alert("Couldn't reject Tree Image: " + id + '!', e)
      })
  }

  const setIsLoading = loading => {
    state.isLoading = loading
  }

  const needtoLoadMoreTreeImages = () => {
    return state.moreTreeImagesAvailable && treeImages.length < state.pageSize;
  };

  const loadMoreTreeImages = () => {
    if (state.isLoading || !state.moreTreeImagesAvailable) return;
    setIsLoading(true);
    const nextPage = state.pagesLoaded + 1;
    const pageParams = {
      page: nextPage,
      rowsPerPage: state.pageSize
    }
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
        dispatch({ type: "noMoreTreeImages" });
      });
  };

  const handleScroll = e => {
    if (
      state.isLoading ||
      (scrollContainerRef &&
        Math.floor(scrollContainerRef.scrollTop) !==
          Math.floor(scrollContainerRef.scrollHeight) -
            Math.floor(scrollContainerRef.offsetHeight))
    ) {
      return
    }
    loadMoreTreeImages()
  }

  scrollContainerRef = getScrollContainerRef();
  if (scrollContainerRef) {
    scrollContainerRef.addEventListener("scroll", handleScroll);
  }

  useEffect(() => {
    if (needtoLoadMoreTreeImages()) {
      loadMoreTreeImages();
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
              >
                Reject
              </Button>
              <Button
                color="primary"
                size="small"
                onClick={e => onApproveTreeImageClick(e, tree.id)}
              >
                Approve
              </Button>
            </CardActions>
          </Card>
        </div>
      )
    }
  })

  return <section className={classes.wrapper}>{treeImageItems}</section>
}

export default compose(
  withStyles(styles, { withTheme: true, name: 'ImageScrubber' })
)(TreeImageScrubber)
