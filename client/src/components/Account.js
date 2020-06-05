import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Menu from './common/Menu'
import AccountIcon from '@material-ui/icons/Person'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { AppContext } from './MainFrame'

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
  const { user } = appContext
  const [openPwdForm, setOpenPwdForm] = React.useState(false)
  const [oldPassword, setOldPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmedPassword, setConfirmedPassword] = React.useState('')

  function handleLogout() {
    appContext.logout()
  }

  const handleClickOpen = () => {
    setOpenPwdForm(true)
  }

  const handleClose = () => {
    setOpenPwdForm(false)
  }

  const onChangeOldPwd = (e) => {
    setOldPassword(e.target.value)
  }

  const onChangeNewPwd = (e) => {
    setNewPassword(e.target.value)
  }

  const onChangeConfirmedPwd = (e) => {
    setConfirmedPassword(e.target.value)
  }

  const handleConfirm = () => {
    console.log(oldPassword, newPassword, confirmedPassword)
  }

  return (
    <>
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
                  <Typography className={classes.item}>{user.username}</Typography>
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
                    {user.role.map((e) => (
                      <span>{e.name}/</span>
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
                        <Button onClick={handleClickOpen} color="primary">
                          CHANGE
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Box height={20} />
                    <Button
                      onClick={handleLogout}
                      color="secondary"
                      variant="contained"
                      className={classes.logout}
                    >
                      LOG OUT
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog open={openPwdForm} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change Password</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="old password"
            type="password"
            id="password"
            // helperText={
            //   userName === '' ? 'Field is required' : '' /*touched.email ? errors.email : ""*/
            // }
            // error={userName === '' /*touched.email && Boolean(errors.email)*/}
            onChange={onChangeOldPwd}
            value={oldPassword}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="new password"
            type="password"
            id="password"
            onChange={onChangeNewPwd}
            value={newPassword}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="confirm password"
            type="password"
            id="password"
            onChange={onChangeConfirmedPwd}
            value={confirmedPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default withStyles(style)(Account)
