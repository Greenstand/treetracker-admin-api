import React, { Component } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles'

import theme from './components/common/theme'
import Verify from './routes/verify/Verify'
import Trees from './routes/trees/Trees'
import paths from './paths'

class App extends Component {
  componentDidMount() {
    // in the future we want to maybe restore the users last filter set from the server
    // as well as deal with all the login state stuff.
    this.props.requestTreeCount()
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path={paths.monitor}>Monitor</Route>
            <Route path={paths.trees}>
              <Trees />
            </Route>
            <Route path={paths.planters}>Planters</Route>
            <Route path={paths.payments}>Payments</Route>
            <Route path={paths.settings}>Settings</Route>
            <Route path={paths.account}>Account</Route>
            <Route path={paths.root}>
              <Verify />
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    )
  }
}

const mapState = (state) => {
  return state
}

const mapDispatch = (dispatch) => ({
  requestTreeCount: () => dispatch.trees.requestTreeCount(),
  requestTrees: () => dispatch.trees.requestTrees(),
})

export default connect(mapState, mapDispatch)(App)
