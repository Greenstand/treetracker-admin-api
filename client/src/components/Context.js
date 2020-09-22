import React from 'react'
import isEqual from 'react-fast-compare'

import TreeImageScrubber from './TreeImageScrubber'
import Planters from './Planters'
import Trees from './Trees'
import Account from './Account'
import Home from './Home'
import Users from './Users'
import SpeciesMgt from './SpeciesMgt'
import TreeTest from './TreeTest'

import IconSettings from '@material-ui/icons/Settings'
import IconShowChart from '@material-ui/icons/ShowChart'
import IconThumbsUpDown from '@material-ui/icons/ThumbsUpDown'
import IconNature from '@material-ui/icons/Nature'
import IconGroup from '@material-ui/icons/Group'
import IconCompareArrows from '@material-ui/icons/CompareArrows'
import IconPermIdentity from '@material-ui/icons/PermIdentity'
import CategoryIcon from '@material-ui/icons/Category'
import HomeIcon from '@material-ui/icons/Home'

import { session, hasPermission, POLICIES } from '../models/auth'
import axios from 'axios'

export const AppContext = React.createContext({})

function getRoutes(user) {
  return [
    {
      name: 'Home',
      linkTo: '/',
      exact: true,
      component: Home,
      icon: HomeIcon,
      disabled: false,
    },
    {
      name: 'Monitor',
      linkTo: '/',
      icon: IconShowChart,
      disabled: true,
    },
    {
      name: 'Verify',
      linkTo: '/verify',
      component: TreeImageScrubber,
      icon: IconThumbsUpDown,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_TREE,
          POLICIES.APPROVE_TREE,
        ]),
    },
    {
      name: 'Trees',
      linkTo: '/trees',
      component: Trees,
      icon: IconNature,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_TREE,

        ]),
    },
    {
      name: 'Planters',
      linkTo: 'planters',
      component: Planters,
      icon: IconGroup,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_PLANTER,

        ]),
    },
    {
      name: 'Payments',
      linkTo: '/',
      icon: IconCompareArrows,
      disabled: true,
    },
    {
      name: 'Species',
      linkTo: '/species',
      component: SpeciesMgt,
      icon: CategoryIcon,
      //TODO this is temporarily, need to add species policy
      disabled:
        (!hasPermission(user, [
          POLICIES.SUPER_PERMISSION,
          POLICIES.LIST_TREE,
        ])) || !user || user.policy.organization !== undefined,
    },
    {
      name: 'Settings',
      linkTo: '/',
      icon: IconSettings,
      disabled: true,
    },
    {
      name: 'User Manager',
      linkTo: '/usermanager',
      component: Users,
      icon: IconGroup,
      disabled: !hasPermission(
        user, [
          POLICIES.SUPER_PERMISSION,
        ]),
    },
    {
      name: 'Account',
      linkTo: '/account',
      component: Account,
      icon: IconPermIdentity,
      disabled: false,
    },
  ].filter(({disabled}) => !disabled)
}

export const AppProvider = (props) => {
  const [user, setUser] = React.useState(undefined)
  const [token, setToken] = React.useState(undefined)
  const [routes, setRoutes] = React.useState(getRoutes(undefined));

  const context = {
    login: (newUser, newToken, rememberDetails) => {
      // This api gets hit with identical users from multiple login calls
      if (!isEqual(user, newUser)) {
        setUser(user)
        session.user = user
        if (rememberDetails) {
          localStorage.setItem('token', JSON.stringify(token))
        }
  
        // By not updating routes object, we can memoize the menu and routes better
        setRoutes(getRoutes(newUser))
      }

      if (!isEqual(token, newToken)) {
        setToken(token)
        session.token = token

        if (rememberDetails) {
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
    },
    logout: () => {
      setUser(undefined)
      setRoutes(getRoutes(undefined))
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
    routes,
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
