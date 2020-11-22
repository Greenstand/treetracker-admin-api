import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Box from '@material-ui/core/Box'
import Drawer from '@material-ui/core/Drawer'
import Close from "@material-ui/icons/Close";
import Person from "@material-ui/icons/Person";
import Divider from "@material-ui/core/Divider";
import { getPlanter } from '../models/planters';

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

    const [planter, setPlanter] = React.useState({})

    const classes = useStyle();
    if (props.planter.id != planter.id) {
      setPlanter(props.planter)
    }
 
    useEffect(() => {
      if (!planter.createdAt) {
        getPlanter(planter.id).then(planterDetail => {
          if (planterDetail && planterDetail.createdAt) {
            setPlanter(planterDetail)
          }
        })
      }
    }, [planter])

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
              <Typography variant="h5" color="primary" className={classes.name} >{planter.firstName} {planter.lastName}</Typography>
              <Typography variant="body2">ID:{planter.id}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Email address</Typography>
              <Typography variant="body1" >{planter.email || "---"}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Phone number</Typography>
              <Typography variant="body1" >{planter.phone || "---"}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Person ID</Typography>
              <Typography variant="body1" >{planter.personId || "---"}</Typography>
            </Grid>
            <Divider/>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Organization</Typography>
              <Typography variant="body1" >{planter.organization || "---" }</Typography>
            </Grid>
            <Divider />
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Organization ID</Typography>
              <Typography variant="body1" >{planter.organizationId || "---"}</Typography>
            </Grid>
            <Grid container direction="column" className={classes.box}>
              <Typography variant="subtitle1" >Registration Date</Typography>
              <Typography variant="body1" >{planter.createdAt || "---"}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Drawer>
    )
  }

  export default (PlanterDetail)