import React from 'react'
import { session } from '../models/auth'

export const AppContext = React.createContext({
  menuName: '',
  // handleMenuChange: () => {},
  // handleHome: () => {},
  //login user
  user: undefined,
})
// export { AppContext }

export const AppProvider = (props) => {
  const [menuName, setMenuName] = React.useState(/* default menu */ 'Login')
  const refContainer = React.useRef()
  const [user, setUser] = React.useState(undefined)
  const [token, setToken] = React.useState(undefined)

  const context = {
    menuName,
    handleMenuChange: (n) => {
      console.log('Set menu to:', n)
      setMenuName(n)
    },
    handleHome: () => {
      console.log('Go to home')
      setMenuName('Home')
    },
    login: (theUser, token) => {
      setUser(theUser)
      setToken(token)
      console.log(theUser, token)
      // setMenuName('Home')
      session.token = token
    },
    logout: () => {
      setUser(undefined)
      setMenuName('Login')
      session.token = undefined
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    user,
    token,
    getContext: () => {
      console.log('get the context!')
    },
  }

  return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
}
