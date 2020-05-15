/*
 * Planter page
 */
import React, { useEffect, useReducer } from "react";
import clsx from "clsx";
import Tooltip from "@material-ui/core/Tooltip";
import { connect } from "react-redux";
import compose from "recompose/compose";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button"; // replace with icons down the line
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

import { selectedHighlightColor } from "../common/variables.js";
import * as loglevel from "loglevel";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Modal from "@material-ui/core/Modal";
import LinearProgress from "@material-ui/core/LinearProgress";
import IconFilter from "@material-ui/icons/FilterList";
import Image from "@material-ui/icons/Image";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Snackbar from "@material-ui/core/Snackbar";
import Drawer from "@material-ui/core/Drawer";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TextField from "@material-ui/core/TextField";
import Species from "./Species";

import Filter, { FILTER_WIDTH } from "./Filter";
import FilterTop from "./FilterTop";
import { MENU_WIDTH } from "./common/Menu";
import FilterModel from "../models/Filter";
import { ReactComponent as TreePin } from "../components/images/highlightedPinNoStick.svg";
import IconLogo from "./IconLogo";
import Menu from "./common/Menu.js";

const log = require("loglevel").getLogger("../components/TreeImageScrubber");

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexWrap: "wrap",
    padding: theme.spacing(2, 16, 4, 16),
    userSelect: "none",
  },
  cardImg: {
    width: "100%",
    height: "auto",
  },
  cardTitle: {
    color: "#f00",
  },
  card: {
    cursor: "pointer",
    margin: "0.5rem",
  },
  cardSelected: {
    backgroundColor: theme.palette.action.selected,
  },
  cardContent: {
    padding: 0,
  },
  selected: {
    border: `2px ${selectedHighlightColor} solid`,
  },
  cardMedia: {
    height: "12rem",
  },
  cardWrapper: {
    "&:not($cardSelected) $card:hover": {
      margin: 0,
      height: "100%",
      "& $cardMedia": {
        height: "13rem",
      },
      transition: theme.transitions.create("height", {
        easing: theme.transitions.easing.easeInOut,
        duration: "0.3s",
      }),
    },
    width: "30%",
    minWidth: 300,
    margin: 2,
  },
  title: {
    padding: theme.spacing(2, 16),
  },
  snackbar: {
    bottom: 20,
  },
  snackbarContent: {
    backgroundColor: theme.palette.action.active,
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    marginRight: "8px",
  },

  appBar: {
    width: "100%",
    left: 0,
    right: "auto",
  },
  sidePanel: {},
  body: {
    width: "100%",
  },
  radioGroup: {
    flexDirection: "row",
  },
  bottomLine: {
    borderBottom: "1px solid lightgray",
  },
  tooltip: {
    maxWidth: "none",
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TreeImageScrubber = (props) => {
  log.debug("render TreeImageScrubber...");
  log.debug("complete:", props.verityState.approveAllComplete);
  const classes = useStyles(props);
  const [complete, setComplete] = React.useState(0);
  const [isFilterShown, setFilterShown] = React.useState(false);
  const [isMenuShown, setMenuShown] = React.useState(false);
  const [dialog, setDialog] = React.useState({ isOpen: false, tree: {} });

  /*
   * effect to load page when mounted
   */
  useEffect(() => {
    log.debug("mounted");
    props.verityDispatch.loadMoreTreeImages();
  }, []);

  /* to display progress */
  useEffect(() => {
    setComplete(props.verityState.approveAllComplete);
  }, [props.verityState.approveAllComplete]);

  //  /* To update unverified tree count */
  //  useEffect(() => {
  //      props.verityDispatch.getTreeCount();
  //  }, [props.verityState.treeImages]);

  function handleTreeClick(e, treeId) {
    e.stopPropagation();
    e.preventDefault();
    log.debug("click at tree:%d", treeId);
    props.verityDispatch.clickTree({
      treeId,
      isShift: e.shiftKey,
      isCmd: e.metaKey,
      isCtrl: e.ctrlKey,
    });
  }

  function handleTreePinClick(e, treeId) {
    e.stopPropagation();
    e.preventDefault();
    log.debug("click at tree:%d", treeId);
    const url = `${process.env.REACT_APP_WEBMAP_DOMAIN}/?treeid=${treeId}`;
    window.open(url, "_blank").opener = null;
  }

  async function handleSubmit(approveAction) {
    console.log("approveAction:", approveAction);
    //check selection
    if (props.verityState.treeImagesSelected.length === 0) {
      window.alert("Please select some tree");
      return;
    }
    /*
     * check species
     */
    const isNew = await props.speciesDispatch.isNewSpecies();
    if (isNew) {
      const answer = await new Promise((resolve, reject) => {
        if (
          window.confirm(
            `The species ${props.speciesState.speciesInput} is a new one, create it?`
          )
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      if (!answer) {
        return;
      } else {
        //create new species
        const species = await props.speciesDispatch.createSpecies();
      }
    }
    const speciesId = await props.speciesDispatch.getSpeciesId();
    if (speciesId) {
      approveAction.speciesId = speciesId;
      console.log("species id:", speciesId);
    }
    const result = await props.verityDispatch.approveAll({ approveAction });
    if (result) {
      //if all trees were approved, then, load more
      if (
        props.verityState.treeImagesSelected.length ===
        props.verityState.treeImages.length
      ) {
        log.debug("all trees approved, reload");
        props.verityDispatch.loadMoreTreeImages();
      }
    } else {
      window.alert("sorry, failed to approve some picture");
    }
  }

  function handleDialog(e, tree) {
    e.preventDefault();
    e.stopPropagation();
    setDialog({
      isOpen: true,
      tree,
    });
  }

  function handleDialogClose() {
    setDialog({
      isOpen: false,
      tree: {},
    });
  }

  let treeImageItems = props.verityState.treeImages.map((tree) => {
    if (tree.imageUrl) {
      return (
        <div
          className={clsx(
            classes.cardWrapper,
            props.verityState.treeImagesSelected.indexOf(tree.id) >= 0
              ? classes.cardSelected
              : undefined
          )}
          key={tree.id}
        >
          <Card
            onClick={(e) => handleTreeClick(e, tree.id)}
            id={`card_${tree.id}`}
            className={classes.card}
            elevation={3}
          >
            <CardContent className={classes.cardContent}>
              <CardMedia className={classes.cardMedia} image={tree.imageUrl} />
            </CardContent>
            <CardActions className={classes.cardActions}>
              <Grid justify="flex-end" container>
                <Grid item>
                  <Image
                    color="primary"
                    onClick={(e) => handleDialog(e, tree)}
                  />
                  <TreePin
                    width="25px"
                    height="25px"
                    title={`Open Webmap for Tree# ${tree.id}`}
                    onClick={(e) => {
                      handleTreePinClick(e, tree.id);
                    }}
                  />
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </div>
      );
    }
  });

  function handleFilterClick() {
    if (isFilterShown) {
      setFilterShown(false);
    } else {
      setFilterShown(true);
    }
  }

  function handleToggleMenu() {
    setMenuShown(!isMenuShown);
  }

  return (
    <React.Fragment>
      <Grid container direction="column">
        <Grid item>
          <AppBar color="default" className={classes.appBar}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justify="space-between">
                  <Grid item>
                    <IconButton>
                      <MenuIcon onClick={handleToggleMenu} />
                    </IconButton>
                    <IconLogo />
                  </Grid>
                  <Grid item>
                    <IconButton onClick={handleFilterClick}>
                      <IconFilter />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              {isFilterShown && (
                <Grid item>
                  <FilterTop
                    isOpen={isFilterShown}
                    onSubmit={(filter) => {
                      props.verityDispatch.updateFilter(filter);
                    }}
                    filter={props.verityState.filter}
                    onClose={handleFilterClick}
                  />
                </Grid>
              )}
            </Grid>
          </AppBar>
        </Grid>
        <Grid
          item
          className={classes.body}
          style={{
            marginTop: isFilterShown ? 100 : 50,
          }}
        >
          <Grid container>
            <Grid
              item
              style={{
                width: "100%",
              }}
            >
              <Grid
                container
                justify={"space-between"}
                className={classes.title}
              >
                <Grid item>
                  <Typography
                    variant="h5"
                    style={{
                      paddingTop: 20,
                    }}
                  >
                    Planters
                  </Typography>
                </Grid>
                <Grid item></Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="column">
                <Grid tiem>
                  Planter A
                </Grid>
                <Grid tiem>
                  Planter B
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isMenuShown && <Menu onClose={() => setMenuShown(false)} />}
      {props.verityState.isApproveAllProcessing && (
        <AppBar
          position="fixed"
          style={{
            zIndex: 10000,
          }}
        >
          <LinearProgress
            color="primary"
            variant="determinate"
            value={complete}
          />
        </AppBar>
      )}
    </React.Fragment>
  );
};

export default connect(
  //state
  (state) => ({
    verityState: state.verity,
    speciesState: state.species,
  }),
  //dispatch
  (dispatch) => ({
    verityDispatch: dispatch.verity,
    speciesDispatch: dispatch.species,
  })
)(TreeImageScrubber);
