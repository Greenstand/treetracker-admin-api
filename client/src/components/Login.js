import React, { useState } from 'react'
import {
  LinearProgress,
  Checkbox,
  Grid,
  Box,
  TextField,
  FormControlLabel,
  CssBaseline,
  Button,
  Avatar,
  Typography,
  Container,
  Link,
  CircularProgress,
} from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import IconLogo from './IconLogo'
import { withStyles } from '@material-ui/core/styles'
import { AppContext } from './MainFrame'
import classNames from 'classnames'

import axios from 'axios'
//import { useAuth } from "../context/auth";
//import Copyright from "components/Copyright";
//import { useHistory } from "react-router-dom";

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  submitText: {
    color: 'white',
  },
  forgetPassword: {
    margin: theme.spacing(2, 0),
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
})

const Login = (props) => {
  //const { setAuthToken } = useAuth();
  const appContext = React.useContext(AppContext)
  const { touched, errors, isSubmitting, handleChange: onChange, handleBlur: onBlur } = {}
  const { classes } = props
  const [userName, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [nameFocus, setNameFocus] = React.useState(false)
  const [passwordFocus, setPasswordFocus] = React.useState(false)
  const [isRemember, setRemember] = React.useState(false)

  React.useEffect(() => {
    //try to load token
    async function load() {
      const token = JSON.parse(localStorage.getItem('token'))
      const user = JSON.parse(localStorage.getItem('user'))
      if (token) {
        const response = await axios.get(`${process.env.REACT_APP_API_ROOT}/auth/check_token`, {
          headers: { Authorization: token },
        })
        if (response.status === 200) {
          //valid token
          appContext.login(user, token)
        }
      }
    }
    load()

    return () => {
      setLoading(false)
    }
  }, [])

  const submitClassname = classNames({
    [classes.submit]: loading,
  })

  function handleUsernameChange(e) {
    setUsername(e.target.value)
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    e.stopPropagation()
    setPasswordFocus(true)
    setNameFocus(true)

    if (!loading) {
      setLoading(true)
    }
    ;(async () => {
      //TODO login request
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_ROOT}/auth/login`, {
          userName,
          password,
        })
        if (res.status === 200) {
          const token = res.data.token
          const user = res.data.user
          //remember
          if (isRemember) {
            localStorage.setItem('token', JSON.stringify(token))
            localStorage.setItem('user', JSON.stringify(user))
          }
          appContext.login(user, token)
          setLoading(true)
        } else {
          setErrorMessage('Invalid user name or password!')
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        setErrorMessage(
          'Can not login, please check your username passowrd or contact the admin ...'
        )
        setLoading(false)
      }
    })()
    return false
  }

  if (isSubmitting) {
    return (
      <Typography component="h3" variant="h5">
        <LinearProgress />
        Vent venligst...
      </Typography>
    )
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {/*
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        */}
        <IconLogo />
        <Box m={2} />
        <Typography variant="h2">Admin Panel</Typography>
        {/*
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        */}
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="userName"
            label="userName"
            name="userName"
            autoComplete="userName"
            onFocus={() => {
              setNameFocus(true)
            }}
            helperText={nameFocus ? 'Field is required' : '' /*touched.email ? errors.email : ""*/}
            error={nameFocus && userName === '' /*touched.email && Boolean(errors.email)*/}
            onChange={handleUsernameChange}
            value={userName}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="password"
            type="password"
            id="password"
            autoComplete="current-password"
            onFocus={() => {
              setPasswordFocus(true)
            }}
            helperText={
              passwordFocus ? 'Field is required' : '' /*touched.password ? errors.password : ""*/
            }
            error={
              passwordFocus && password === '' /*touched.password && Boolean(errors.password)*/
            }
            onChange={handlePasswordChange}
            value={password}
          />
          <Grid container justify="space-between">
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    name="remember"
                    checked={isRemember}
                    onClick={() => setRemember(!isRemember)}
                    value="remember"
                    color="primary"
                  />
                }
                label="remember me"
              />
            </Grid>
            <Grid item>
              {/*
              <Box className={classes.forgetPassword}>
                <Link href="/reset_password" variant="body2">
                  Forgot password?
                </Link>
              </Box>
              */}
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="error">
            {errorMessage}
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            // className={classes.submit}
            className={submitClassname}
          >
            <Typography className={classes.submitText}>LOGIN</Typography>
          </Button>
          {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          {/*
          <Grid container justify="center">
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Har du ikke en konto? Opret bruger"}
              </Link>
            </Grid>
          </Grid>
          */}
        </form>
      </div>
    </Container>
  )
}

export default withStyles(styles)(Login)
