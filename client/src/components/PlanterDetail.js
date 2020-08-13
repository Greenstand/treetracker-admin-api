import React from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Box from '@material-ui/core/Box'
import Drawer from '@material-ui/core/Drawer'
import Close from "@material-ui/icons/Close";
import Person from "@material-ui/icons/Person";
import Divider from "@material-ui/core/Divider";

const useStyle = makeStyles(theme => ({
    root: {
      width: 441,
    },
    box: {
      padding: theme.spacing(4),
    },
    cardMedia: {
      height: "378px",
    },
    personBox: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "lightgray",
      height: "100%",
    },
    person: {
      height: 180,
      width: 180,
      fill: "gray",
    },
    name: {
      textTransform: "capitalize",
    },
  }));

function PlanterDetail(props){

    const classes = useStyle();
    const {
      planter,
    } = props;
  
    return(
      <Drawer anchor="right" open={props.open} onClose={props.onClose}>
        <Grid className={classes.root} >
          <Grid container direction="column">
            <Grid item>
              <Grid container justify="space-between" alignItems="center" >
                <Grid item>
                  <Box m={4} >
                    <Typography color="primary" variant="h6" >
                      Planter Detail
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <IconButton>
                    <Close onClick={() => props.onClose()} />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
  
              {planter.imageUrl &&
                <CardMedia className={classes.cardMedia} image={planter.imageUrl} />
              }
              {!planter.imageUrl &&
                <CardMedia className={classes.cardMedia} >
                  <Grid container className={classes.personBox} >
                    <Person className={classes.person} />
                  </Grid>
                </CardMedia>
              }
            </Grid>
            <Grid item className={classes.box} >
              <Typography variant="h5" color="primary" className={classes.name} >{props.planter.firstName} {props.planter.lastName}</Typography>
              <Typography variant="body2">ID:{props.planter.id}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Email address</Typography>
              <Typography variant="body1" >{props.planter.email || "---"}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Phone number</Typography>
              <Typography variant="body1" >{props.planter.phone || "---"}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Person ID</Typography>
              <Typography variant="body1" >{props.planter.personId || "---"}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Organization</Typography>
              <Typography variant="body1" >{props.planter.organization || "---" }</Typography>
            </Grid>
            <Divider />
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Organization ID</Typography>
              <Typography variant="body1" >{props.planter.organizationId || "---"}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Drawer>
    )
  }

  export default (PlanterDetail)