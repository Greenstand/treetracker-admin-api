import React from 'react'
import { session } from '../models/auth'

export const AppContext = React.createContext({})

export const AppProvider = (props) => {
  const [user, setUser] = React.useState(undefined)
  const [token, setToken] = React.useState(undefined)

  const context = {
    login: (user, token) => {
      setUser(user)
      setToken(token)
      session.token = token
      session.user = user
    },
    logout: () => {
      setUser(undefined)
      session.token = undefined
      session.user = undefined
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    user,
    token,
  }

  return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
}
