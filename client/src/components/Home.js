import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import Menu from './common/Menu'

const style = (theme) => ({
  box: {
    height: '100%',
  },
  menu: {
    height: '100%',
  },
  rightBox: {
  },
  welcomeBox:{
    height: "100%",
  },
})

function Home(props) {
  const { classes } = props

  return (
    <Grid container className={classes.box}>
      <Grid item xs={3} >
        <Paper elevation={3} className={classes.menu}>
          <Menu variant="plain" />
        </Paper>
      </Grid>
      <Grid item xs={9} >
        <Grid container className={classes.welcomeBox} justify="center" alignItems="center" >
          <Typography variant="h4" color="primary">
            Welcome to Greenstand Admin Panel
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withStyles(style)(Home)
