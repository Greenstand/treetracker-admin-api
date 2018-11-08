import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import AppFrame from './components/environments/AppFrame/AppFrame'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#517147'
    }
  }
})

class App extends Component {

  componentDidMount() {
    // in the future we want to maybe restore the users last filter set from the server
    // as well as deal with all the login state stuff.
    this.props.requestTreeCount()
  }

  render() {
    return(
      <MuiThemeProvider theme={theme}>
        <AppFrame />
      </MuiThemeProvider>
    )
  }
}

const mapState = state => {
  return state
}

const mapDispatch = dispatch => ({
  requestTreeCount: id => dispatch.trees.requestTreeCount(),
  requestTrees: id => dispatch.trees.requestTrees()
})

export default connect(mapState, mapDispatch)(App)
