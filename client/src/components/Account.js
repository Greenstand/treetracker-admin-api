import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Menu from './common/Menu'
import AccountIcon from '@material-ui/icons/Person'
import { AppContext } from './MainFrame'
import axios from 'axios' 

const style = (theme) => ({
  box: {
    height: '100%',
  },
  menu: {
    height: '100%',
  },
  rightBox: {
    height: '100%',
    padding: theme.spacing(8),
  },
  titleBox: {
    marginBottom: theme.spacing(4),
  },
  accountIcon: {
    fontSize: 67,
    marginRight: 11,
  },
  title: {
    fontSize: 33,
    marginBottom: theme.spacing(2),
  },
  item: {
    fontSize: 24,
    marginBottom: theme.spacing(3),
  },
  bodyBox: {
    paddingLeft: theme.spacing(4),
  },
  changeBox: {
    height: '100%',
  },
  logout: {
    width: 250,
  },
})

function Account(props) {
  const { classes } = props
  const appContext = React.useContext(AppContext)
  const { user, token } = appContext 


  function handleLogout(){
    appContext.logout();
  }


  const [permissions, setPermissions] = React.useState([])
  const [users, setUsers] = React.useState([])
 
  //loading permission from server
  async function load() {
    let res = await axios.get(`${process.env.REACT_APP_API_ROOT}/auth/permissions`, {
      headers: { Authorization: token },
    })
    if (res.status === 200) {
      setPermissions(res.data)
      console.log(res.data);
    } else {
      console.error('load fail:', res)
      return
    }
    res = await axios.get(`${process.env.REACT_APP_API_ROOT}/auth/admin_users`, {
      headers: { Authorization: token },
    })
    if (res.status === 200) {
      setUsers(res.data)
    } else {
      console.error('load fail:', res)
      return
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  return (
    <Grid container className={classes.box}>
      <Grid item xs={3}>
        <Paper elevation={3} className={classes.menu}>
          <Menu variant="plain" />
        </Paper>
      </Grid>
      <Grid item xs={9}>
        <Grid container className={classes.rightBox}>
          <Grid item xs="12">
            <Grid container className={classes.titleBox}>
              <Grid item>
                <AccountIcon className={classes.accountIcon} />
              </Grid>
              <Grid item>
                <Typography variant="h2">Account</Typography>
              </Grid>
            </Grid>
            <Grid container direction="column" className={classes.bodyBox}>
              <Grid item>
                <Typography className={classes.title}>Username</Typography>
                <Typography className={classes.item}>{user.userName}</Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.title}>Name</Typography>
                <Typography className={classes.item}>
                  {user.firstName} {user.lastName}
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.title}>Email</Typography>
                <Typography className={classes.item}>{user.email}</Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.title}>Role</Typography>
                <Typography className={classes.item}>
                  {users.map((user) => ( 
                    user.role.map((r, i) => (
                      <Grid key={i}>
                        {
                          permissions.reduce(
                            (a, c) => a || (c.id === r ? c : undefined),
                            undefined
                          ).roleName
                        }
                      </Grid>
                      ))
                  ))}
                </Typography>
              </Grid>
              <Grid item xs="8">
                <Grid container justify="space-between">
                  <Grid item>
                    <Typography className={classes.title}>Password</Typography>
                  </Grid>
                  <Grid item>
                    <Grid
                      container
                      justif="center"
                      alignItems="center"
                      className={classes.changeBox}
                    >
                      <Button color="primary">CHANGE</Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Box height={20} />
                  <Button onClick={handleLogout} color="secondary" variant="contained" className={classes.logout}>
                    LOG OUT
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withStyles(style)(Account)
