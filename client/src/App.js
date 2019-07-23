import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import AppFrame from './components/AppFrame'

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#517147'
    }
  },
	/* No better way to adjust the table column width, so have to set css here*/
	overrides: {
    MUIDataTableHeadCell: {
      root: {
        '&:nth-child(1)': {
          width: 20
        },
        '&:nth-child(2)': {
          width: 30
        },
        '&:nth-child(3)': {
          width: 30
        },
        '&:nth-child(4)': {
          width: 30
        },
        '&:nth-child(5)': {
          width: 30
        },
        '&:nth-child(6)': {
          width: 30
        },
        '&:nth-child(7)': {
          width: 30
        },
        '&:nth-child(8)': {
          width: 200, 
        },
      }
    }
  }
})

class App extends Component {
  componentDidMount () {
    // in the future we want to maybe restore the users last filter set from the server
    // as well as deal with all the login state stuff.
    this.props.requestTreeCount()
  }

  render () {
    return (
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

export default connect(
  mapState,
  mapDispatch
)(App)
