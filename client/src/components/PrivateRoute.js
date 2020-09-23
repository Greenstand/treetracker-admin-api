import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AppContext } from './Context'

export default function PrivateRoute({ component: Component, ...rest }) {
  const appContext = React.useContext(AppContext)

  return (
    <Route
      {...rest}
      render={(props) =>
        appContext.isLoggedIn() ? <Component {...props} /> : <Redirect to={{
          pathname: "/login",
          state: { from: props.location }
        }} />
      }
    />
  )
}
