import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table'
import Typography from '@material-ui/core/Typography'
import Group from '@material-ui/icons/Group'
import Edit from '@material-ui/icons/Edit'
import VpnKey from '@material-ui/icons/VpnKey'
import Delete from '@material-ui/icons/Delete'
import EmojiObjects from '@material-ui/icons/EmojiObjects'
import { withStyles } from '@material-ui/core/styles'
import Menu from './common/Menu'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'

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
  addUserBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUser: {
    color: 'white',
  },
  input: {
    margin: theme.spacing(0, 1, 4, 1),
  },
  firstName: {
    marginRight: theme.spacing(1),
  },
  lastName: {
    marginRight: theme.spacing(1),
  },
  paper: {
    width: 200,
    height: 230,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
  noteBox: {
    backgroundColor: "lightgray",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
  },

})

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1)
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1)
}

const permissions = [{
    id: 0,
    name: "admin",
  },{
    id: 1,
    name: "Tree Auditor",
  }]

function Users(props) {
  const { classes } = props
  const users = [
    {
      username: 'dadiorchen',
      firstName: 'Dadior',
      lastName: 'Chen',
      email: 'dadiorchen@outlook.com',
      role: [
        {
          id: 0,
          name: 'admin',
        },
        {
          id: 1,
          name: 'Tree Auditor',
        },
      ],
    },
  ]
  const [userEditing, setUserEditing] = React.useState(undefined);
  const [userPassword, setUserPassword] = React.useState(undefined);
  const [newPassword, setNewPassword] = React.useState("");

  function handleEdit(user) {
    setUserEditing(user)
    setLeft(permissions.filter(p => user.role.every(r => r.id !== p.id)));
    setRight(permissions.filter(p => user.role.some(r => r.id === p.id)));
  }

  function handleClose() {}

  const [checked, setChecked] = React.useState([])
  const [left, setLeft] = React.useState(permissions);
  const [right, setRight] = React.useState([])

  const leftChecked = intersection(checked, left)
  const rightChecked = intersection(checked, right)

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
  }

  const handleAllRight = () => {
    setRight(right.concat(left))
    setLeft([])
  }

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked))
    setLeft(not(left, leftChecked))
    setChecked(not(checked, leftChecked))
  }

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked))
    setRight(not(right, rightChecked))
    setChecked(not(checked, rightChecked))
  }

  const handleAllLeft = () => {
    setLeft(left.concat(right))
    setRight([])
  }
  const customList = (items) => (
    <Paper variant="outlined" className={classes.paper}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value.id}-label`

          return (
            <ListItem key={value.id} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.name} />
            </ListItem>
          )
        })}
        <ListItem />
      </List>
    </Paper>
  )

  function handleSave(){
    setUserEditing(undefined);
  }

  function handleGeneratePassword(user){
    setUserPassword(user);
  }

  function handleGenerate(){
    setUserPassword(undefined);
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
              <Grid container justify="space-between" className={classes.titleBox}>
                <Grid item>
                  <Grid container>
                    <Grid item>
                      <Group className={classes.accountIcon} />
                    </Grid>
                    <Grid item>
                      <Typography variant="h2">User Manager</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item className={classes.addUserBox}>
                  <Button variant="contained" className={classes.addUser} color="primary">
                    ADD USER
                  </Button>
                </Grid>
              </Grid>
              <Grid container direction="column" className={classes.bodyBox}>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Userame</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Operations</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.username}>
                          <TableCell component="th" scope="row">
                            {user.username}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.status}</TableCell>
                          <TableCell>
                            {user.role.map((r) => (
                              <Grid>{r.name}</Grid>
                            ))}
                          </TableCell>
                          <TableCell>
                            <IconButton title="edit" onClick={() => handleEdit(user)}>
                              <Edit />
                            </IconButton>
                            <IconButton>
                              <Delete />
                            </IconButton>
                            <IconButton title="generate password" onClick={() => handleGeneratePassword(user)} >
                              <VpnKey />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        open={userEditing !== undefined}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">User Detail</DialogTitle>
        <DialogContent>
          {/*
        <DialogContentText>
          To subscribe to this website, please enter your email address here. We will send updates
          occasionally.
        </DialogContentText>
        */}
          <TextField
            autoFocus
            id="username"
            label="Username"
            type="text"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            disabled
            value={(userEditing && userEditing.username) || ''}
            className={classes.input}
          />
          <Grid container>
            <Grid item className={classes.firstName}>
              <TextField
                autoFocus
                id="firstName"
                label="First Name"
                type="text"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={(userEditing && userEditing.firstName) || ''}
                className={classes.input}
              />
            </Grid>
            <Grid item className={classes.lastName}>
              <TextField
                autoFocus
                id="lastName"
                label="Last Name"
                type="text"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={(userEditing && userEditing.lastName) || ''}
                className={classes.input}
              />
            </Grid>
          </Grid>
          <TextField
            autoFocus
            id="email"
            label="Email"
            type="text"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={(userEditing && userEditing.email) || ''}
            className={classes.input}
          />
          <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
            <Grid item>{customList(left)}</Grid>
            <Grid item>
              <Grid container direction="column" alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.button}
                  onClick={handleAllRight}
                  disabled={left.length === 0}
                  aria-label="move all right"
                >
                  ≫
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.button}
                  onClick={handleCheckedRight}
                  disabled={leftChecked.length === 0}
                  aria-label="move selected right"
                >
                  &gt;
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.button}
                  onClick={handleCheckedLeft}
                  disabled={rightChecked.length === 0}
                  aria-label="move selected left"
                >
                  &lt;
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.button}
                  onClick={handleAllLeft}
                  disabled={right.length === 0}
                  aria-label="move all left"
                >
                  ≪
                </Button>
              </Grid>
            </Grid>
            <Grid item>{customList(right)}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={userPassword !== undefined}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Generate Password</DialogTitle>
        <DialogContent>
          {/*
        <DialogContentText>
          To subscribe to this website, please enter your email address here. We will send updates
          occasionally.
        </DialogContentText>
        */}
        <Grid container className={classes.noteBox} >
            <Grid item xs="1" >
              <EmojiObjects/>
            </Grid>
            <Grid item xs="11">
              <Typography className={classes.note} >
                Please be careful, once you generate a new password, then the current password for this user will be dedicated.
              </Typography>
            </Grid>
          </Grid>
          <TextField
            autoFocus
            id="newPassword"
            label="Please input new password"
            type="text"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={newPassword}
            className={classes.input}
            helperText="We automatically generated a password for you, if you don't like it, you can put a new one by yourself."
          />
          <Box height={20} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleGenerate} variant="contained" color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default withStyles(style)(Users)
