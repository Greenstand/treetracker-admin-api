import React, { Component } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles'
import MainFrame from './components/MainFrame'
import theme from './components/common/theme'

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
            <Route path={'/explorer/monitor'}>Monitor</Route>
            <Route path={'/explorer/trees'}>Trees</Route>
            <Route path={'/explorer/planters'}>Planters</Route>
            <Route path={'/explorer/payments'}>Payments</Route>
            <Route path={'/explorer/settings'}>Settings</Route>
            <Route path={'/explorer/account'}>Account</Route>
            <Route path={'/explorer'}>
              <MainFrame />
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
