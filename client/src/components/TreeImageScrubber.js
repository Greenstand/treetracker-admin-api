import React, { useEffect, useReducer } from "react";
import {
  getTreeImages,
  approveTreeImage,
  rejectTreeImage
} from "../api/treeTrackerApi";

import compose from "recompose/compose";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button"; // replace with icons down the line
import { selectedHighlightColor } from "../common/variables.js";

const styles = theme => ({
  wrapper: {
    display: "flex",
    flexWrap: "wrap",
    padding: "2rem 2rem 4rem"
  },
  cardImg: {
    width: "100%",
    height: "auto"
  },
  cardTitle: {
    color: "#f00"
  },
  card: {
    cursor: "pointer",
    margin: "0.5rem",
    border: `2px #eee solid`
  },
  selected: {
    border: `2px ${selectedHighlightColor} solid`
  },
  cardMedia: {
    height: "12rem"
  },
  cardWrapper: {
    width: "33.33%"
  }
});

const initialState = {
  treeImages: [],
  isLoading: false,
  pagesLoaded: -1,
  noMoreTreeImagesToLoad: false,
  pageSize: 30
};

function reducer(state, action) {
  let treeImages = {};
  switch (action.type) {
    case "loadMoreTreeImages":
      let newTreeImages = [...state.treeImages, ...action.treeImages];
      let newState = {
        ...state,
        treeImages: newTreeImages
      };
      return newState;
    case "approveTreeImage":
      treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== action.id
      );
      return { ...state, treeImages: treeImages };
    case "rejectTreeImage":
      treeImages = state.treeImages.filter(
        treeImage => treeImage.id !== action.id
      );
      return { ...state, treeImages: treeImages };
    default:
      throw new Error("the actions got messed up, somehow!");
  }
}

function TreeImageScrubber({ classes, getScrollContainerRef, ...props }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState });

  let treeImages = state.treeImages;
  let scrollContainerRef = null;

  const onApproveTreeImageClick = (e, id) => {
    approveTreeImage(id)
      .then(result => {
        dispatch({ type: "approveTreeImage", id });
      })
      .catch(e => {
        // don't change the state if the server couldnt help us
        alert("Couldn't approve Tree Image: " + id + "!", e);
      });
  };

  const onRejectTreeImageClick = (e, id) => {
    rejectTreeImage(id)
      .then(result => {
        dispatch({ type: "rejectTreeImage", id });
      })
      .catch(e => {
        // don't change the state if the server couldnt help us
        alert("Couldn't reject Tree Image: " + id + "!", e);
      });
  };

  const setIsLoading = loading => {
    state.isLoading = loading;
  };

  const loadMoreTreeImages = () => {
    setIsLoading(true);
    console.log(state);
    const nextPage = state.pagesLoaded + 1;
    const pageParams = {
      page: nextPage,
      rowsPerPage: state.pageSize
    };
    getTreeImages(pageParams)
      .then(result => {
        setIsLoading(false);
        state.pagesLoaded = nextPage;
        dispatch({ type: "loadMoreTreeImages", treeImages: result });
      })
      .catch(error => {
        // no more to load!
        state.noMoreTreeImagesToLoad = true;
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
      return;
    }
    loadMoreTreeImages();
  };

  useEffect(() => {
    scrollContainerRef = getScrollContainerRef()
      ? getScrollContainerRef()
      : null;
    if (treeImages.length === 0) {
      console.log("at 0 again!", state);
      loadMoreTreeImages();
    }

    if (scrollContainerRef) {
      scrollContainerRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollContainerRef) {
        scrollContainerRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  let treeImageItems = treeImages.map(tree => {
    if (tree.imageUrl) {
      return (
        <div className={classes.cardWrapper} key={tree.id}>
          <Card id={`card_${tree.id}`} className={classes.card}>
            <CardContent>
              <CardMedia className={classes.cardMedia} image={tree.imageUrl} />
              <Typography
                className={classes.cardTitle}
                color="textSecondary"
                gutterBottom
              >
                Tree# {tree.id}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={e => onRejectTreeImageClick(e, tree.id)}
              >
                Reject
              </Button>
              <Button
                size="small"
                onClick={e => onApproveTreeImageClick(e, tree.id)}
              >
                Approve
              </Button>
            </CardActions>
          </Card>
        </div>
      );
    }
  });

  return <section className={classes.wrapper}>{treeImageItems}</section>;
}

export default compose(
  withStyles(styles, { withTheme: true, name: "ImageScrubber" })
)(TreeImageScrubber);
