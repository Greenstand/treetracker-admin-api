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
    padding: "2rem"
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

const initialState = { treeImages: [], isLoading: false };

function reducer(state, action) {
  let treeImages = {};
  switch (action.type) {
    case "loadTreeImages":
      return { ...state, treeImages: action.treeImages };
    case "loadMoreTrees":
      return { ...state, treeImages: [...state.treeImages, action.treeImages] };
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

function TreeImageScrubber({ classes, ...props }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  let treeImages = state.treeImages;
  let container = null;

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

  const setContainerRef = el => {
    container = el;
  };

  const loadMoreTrees = () => {
    setIsLoading(true);
    const pageParams = {
      page: 1,
      rowsPerPage: 5
    };
    getTreeImages(pageParams)
      .then(result => {
        dispatch("getMoreTrees");
      })
      .catch(error => {
        alert("Couldn't load more Tree Images!");
      });
  };

  const handleScroll = e => {
    console.log(e);
    if (
      !state.isLoading &&
      container &&
      container.scrollTop !== container.offsetHeight
    ) {
      return;
    }
    loadMoreTrees();
    console.log("Load more list items!");
  };

  useEffect(() => {
    if (treeImages.length === 0) {
      const pageParams = {
        page: 0,
        rowsPerPage: 5
      };
      getTreeImages(pageParams)
        .then(result => {
          dispatch({ type: "loadTreeImages", treeImages: result });
        })
        .catch(error => {
          // pro error stuff here
          alert("Couldn't load any Tree Images!");
        });
    }
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
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
