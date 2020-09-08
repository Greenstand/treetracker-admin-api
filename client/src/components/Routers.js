import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import TreeImageScrubber from './TreeImageScrubber'
import Planters from './Planters'
import Trees from './Trees'
import Login from './Login'
import Account from './Account'
import Home from './Home'
import Users from './Users'
import SpeciesMgt from './SpeciesMgt'
import PrivateRoute from './PrivateRoute'

export default function Routers() {
  const refContainer = React.useRef()

  return (
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
            <PrivateRoute path="/usermanager" component={Users} />
            {/* <PrivateRoute path="/treetest" component={TreeTest} />Remove TreeTest if needed  */}
            <PrivateRoute path="/trees" component={Trees} />
            <PrivateRoute
              path="/verify"
              component={TreeImageScrubber}
              getScrollContainerRef={() => refContainer.current}
            />
            <PrivateRoute path="/species" component={SpeciesMgt} />
            <PrivateRoute path="/planters" component={Planters} />
            <PrivateRoute path="/account" component={Account} />
          </Switch>
        </Grid>
      </Grid>
    </Grid>
  )
}
