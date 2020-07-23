import React, { Component } from 'react'
import { Link, Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom'
import { session } from '../models/auth'
import { AppProvider, AppContext } from './Context'

export default function PrivateRoute({ component: Component, ...rest }) {
  const appContext = React.useContext(AppContext)

  return (
    <Route
      {...rest}
      render={(props) =>
        appContext.user && appContext.token ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  )
}
