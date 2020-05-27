import React from 'react';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';

import IconLogo		from './IconLogo';
import Menu from './common/Menu.js'

const log = require('loglevel').getLogger('../components/Navbar');

const useStyles = makeStyles(theme => ({
  toolbar: {
    minHeight: '48px',
  },
}));

const Navbar = (props) => {
  log.debug('render Navbar...');
  const [isMenuShown, setMenuShown] = React.useState(false)
  const classes = useStyles(props);

  function handleMenuClick() {
    setMenuShown(!isMenuShown)
  }

  return (
    <React.Fragment>
      <AppBar color='default' className={props.className}>
        <Grid container direction='column'>
          <Toolbar className={classes.toolbar}>
            <Grid container justify='space-between'>
              <Grid item>
                <IconButton title="menu" onClick={() => handleMenuClick()}>
                  <MenuIcon/>
                </IconButton>
                <IconLogo/>
              </Grid>
              <Grid item>
                {props.buttons}
              </Grid>
            </Grid>
          </Toolbar>
          <Grid item>
            {props.children}
          </Grid>
        </Grid>
      </AppBar>
      <Toolbar className={classes.toolbar}/>
      {isMenuShown && <Menu onClose={() => setMenuShown(false)} />}
    </React.Fragment>
  )
}

export default connect(
  //state
  state => ({}),
  //dispatch
  dispatch => ({})
)(Navbar);
