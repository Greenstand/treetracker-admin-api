import React from 'react'
import { session } from '../models/auth'
import axios from 'axios'

export const AppContext = React.createContext({})

export const AppProvider = (props) => {
  const [user, setUser] = React.useState(undefined)
  const [token, setToken] = React.useState(undefined)

  const context = {
    login: (user, token, rememberDetails) => {
      setUser(user)
      setToken(token)
      session.token = token
      session.user = user
      if (rememberDetails) {
        localStorage.setItem('token', JSON.stringify(token))
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    logout: () => {
      setUser(undefined)
      session.token = undefined
      session.user = undefined
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    isLoggedIn: () => {
      return (session.user && session.token)
    },
    user,
    token,
  }

  const localToken = JSON.parse(localStorage.getItem('token'))
  const localUser = JSON.parse(localStorage.getItem('user'))
  if (localUser && localToken) {
    session.user = localUser
    session.token = localToken
  }

  React.useLayoutEffect(() => {
    //try to load localToken
    async function load() {
      const localToken = JSON.parse(localStorage.getItem('token'))
      const localUser = JSON.parse(localStorage.getItem('user'))
      if (localToken && localUser) {
        context.login(localUser, localToken)
        const response = await axios.get(
          `${process.env.REACT_APP_API_ROOT}/auth/check_session?id=${localUser.id}`,
          {
            headers: { Authorization: localToken },
          }
        )
        if (response.status === 200) {
          if (response.data.token === undefined) {
            //the role not change
            context.login(localUser, localToken, true)
          } else {
            //role changes, update the token
            context.login(localUser, response.data.token, true)
          }
        } else if (response.status === 401) {
          context.logout()
        }
      }
    }

    if (!user || !token) {
      load()
    }
  }, [context])

  return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
}
