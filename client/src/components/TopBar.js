import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import IconLogo		from './IconLogo';
import { connect } from 'react-redux';
import Box		from '@material-ui/core/Box';
import Filter, { FILTER_WIDTH } from './Filter';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
}));

const TopBar = ({...props }) => {
  const classes = useStyles();

  function toggleIsMenuShown() {
    if (props.verityState.isMenuShown) {
      props.verityDispatch.setIsMenuShown(false);   
    } else {
      props.verityDispatch.setIsMenuShown(true);
    }      
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{ backgroundColor: "transparent", width: `calc(100vw - ${FILTER_WIDTH}px` }}>
        <Toolbar>
        <Box p={4} >
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleIsMenuShown}
          >
            <MenuIcon />
          </IconButton>
					  <IconLogo/>
				  </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}


export default connect(
  //state
  state => ({
    verityState: state.verity
  }),
  //dispatch
  dispatch => ({
    verityDispatch: dispatch.verity
  })
)(TopBar);