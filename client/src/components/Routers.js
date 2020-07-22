import React, { Component } from 'react'
import { Link, Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom'
import { session } from '../models/auth'
import { makeStyles } from '@material-ui/core/styles'
import Menu from './common/Menu'
import Filter from './Filter'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TextField from '@material-ui/core/TextField'
import TableFooter from '@material-ui/core/TableFooter'
import TablePagination from '@material-ui/core/TablePagination'
import IconSettings from '@material-ui/icons/Settings'
import IconSearch from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconCloudDownload from '@material-ui/icons/CloudDownload'
import FilterModel from '../models/Filter'
import Typography from '@material-ui/core/Typography'
import TreeImageScrubber from './TreeImageScrubber'
import Planters from './Planters'
import Trees from './Trees'
import Login from './Login'
import Account from './Account'
import Home from './Home'
import Users from './Users'
import { AppProvider, AppContext } from './Context'
import PrivateRoute from './PrivateRoute'

export default function Routers() {
  const refContainer = React.useRef()

  // const appContext = React.useContext(AppContext)

  return (
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/trees">Trees</Link>
        </li>
        <li>
          <Link to="/users">User Manager</Link>
        </li>
        <li>
          <Link to="/treetest">TreeTest</Link>
        </li>
        <li>
          <Link to="/verify">Verify</Link>
        </li>
        <li>
          <Link to="/planters">Planters</Link>
        </li>
        <li>
          <Link to="/account">Account</Link>
        </li>
      </ul>
      <Grid container wrap="nowrap">
        <Grid
          item
          style={{
            width: '100%',
          }}
        >
          <Grid
            container
            ref={refContainer}
            style={{
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Switch>
              <Route path="/login" component={Login} />
              <PrivateRoute exact path="/" component={Home} />
              <PrivateRoute path="/trees" component={Trees} />
              <PrivateRoute path="/users" component={Users} />
              <PrivateRoute path="/treetest" component={Trees} />
              <PrivateRoute path="/trees" component={Trees} />
              <PrivateRoute
                path="/verify"
                render={() => (
                  <TreeImageScrubber getScrollContainerRef={() => refContainer.current} />
                )}
              />
              <PrivateRoute path="/planters" component={Planters} />
              <PrivateRoute path="/account" component={Account} />

              {/* <Route path="/trees" component={Trees} /> */}
              {/* 
        <Route path="/users" component={Users} />
        <Route path="/treetest" component={Trees} />
        <Route
          path="/verify"
          render={() => (
            <TreeImageScrubber getScrollContainerRef={() => appContext.refContainer.current} />
          )}
        /> */}
            </Switch>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}
