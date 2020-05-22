/*
 * Planter page
 */
import React, { useEffect, useReducer } from 'react'
import clsx from 'clsx'
import Tooltip from '@material-ui/core/Tooltip'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button' // replace with icons down the line
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import Pagination from '@material-ui/lab/Pagination'

import { selectedHighlightColor } from '../common/variables.js'
import * as loglevel from 'loglevel'
import Grid from '@material-ui/core/Grid'
import AppBar from '@material-ui/core/AppBar'
import Modal from '@material-ui/core/Modal'
import LinearProgress from '@material-ui/core/LinearProgress'
import IconFilter from '@material-ui/icons/FilterList'
import Image from '@material-ui/icons/Image'
import IconButton from '@material-ui/core/IconButton'
import Box from '@material-ui/core/Box'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Snackbar from '@material-ui/core/Snackbar'
import Drawer from '@material-ui/core/Drawer'
import MenuIcon from '@material-ui/icons/Menu'
import Toolbar from '@material-ui/core/Toolbar'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TextField from '@material-ui/core/TextField'
import Species from './Species'
import Close from "@material-ui/icons/Close";

import FilterTopPlanter from './FilterTopPlanter'
import { MENU_WIDTH } from './common/Menu'
import FilterPlanter from '../models/FilterPlanter'
import { ReactComponent as TreePin } from '../components/images/highlightedPinNoStick.svg'
import IconLogo from './IconLogo'
import Menu from './common/Menu.js'
import Avatar from "@material-ui/core/Avatar";
import Person from "@material-ui/icons/Person";
import Divider from "@material-ui/core/Divider";

const log = require('loglevel').getLogger('../components/TreeImageScrubber')

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(2, 16, 4, 16),
    userSelect: 'none',
  },
  cardImg: {
    width: '100%',
    height: 'auto',
  },
  cardTitle: {
    color: '#f00',
  },
  card: {
    cursor: 'pointer',
    margin: '0.5rem',
  },
  cardSelected: {
    backgroundColor: theme.palette.action.selected,
  },
  cardContent: {
    padding: 0,
  },
  selected: {
    border: `2px ${selectedHighlightColor} solid`,
  },
  cardMedia: {
    height: '12rem',
  },
  cardWrapper: {
    width: 200,
  },
  planterCard: {
    borderRadius: 16,
    border: "1px solid rgba(0, 0, 0, 0.12)",
    boxShadow: "none",
  },
  title: {
    padding: theme.spacing(2, 16),
  },
  snackbar: {
    bottom: 20,
  },
  snackbarContent: {
    backgroundColor: theme.palette.action.active,
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    marginRight: '8px',
  },

  appBar: {
    width: '100%',
    left: 0,
    right: 'auto',
  },
  sidePanel: {},
  body: {
    width: '100%',
  },
  radioGroup: {
    flexDirection: 'row',
  },
  bottomLine: {
    borderBottom: '1px solid lightgray',
  },
  tooltip: {
    maxWidth: 'none',
  },
  page: {
    margin: theme.spacing(4),
  },
  personBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgray",
    height: "100%",
  },
  person: {
    height: 90,
    width: 90,
    fill: "gray",
  },
  name: {
    textTransform: "capitalize",
  },
}))

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const Planters = (props) => {
  log.debug('render TreeImageScrubber...')
  const classes = useStyles(props)
  const [isFilterShown, setFilterShown] = React.useState(false)
  const [isMenuShown, setMenuShown] = React.useState(false)
  const [isDetailShown, setDetailShown] = React.useState(false)
  const [planterDetail, setPlanterDetail] = React.useState({});

  /*
   * effect to load page when mounted
   */
  useEffect(() => {
    log.debug('mounted')
    props.plantersDispatch.count()
    props.plantersDispatch.load({
      pageNumber: 1,
      filter: new FilterPlanter(),
    })
  }, [])

  function handlePlanterClick(planter){
    debugger
    setDetailShown(true);
    setPlanterDetail(planter);
  }

  let plantersItems = props.plantersState.planters.map((planter) => {
    return (
      <Planter onClick={() => handlePlanterClick(planter)} key={planter.id} planter={planter} />
    )
  })

  function handleFilterClick() {
    if (isFilterShown) {
      setFilterShown(false)
    } else {
      setFilterShown(true)
    }
  }

  function handleToggleMenu() {
    setMenuShown(!isMenuShown)
  }

  function handlePageChange(e, page){
    props.plantersDispatch.load({
      pageNumber: page,
      filter: props.plantersState.filter,
    });
  }

  function updateFilter(filter){
    props.plantersDispatch.load({
      pageNumber: 1,
      filter,
    });
  }

  return (
    <React.Fragment>
      <Grid container direction="column">
        <Grid item>
          <AppBar color="default" className={classes.appBar}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justify="space-between">
                  <Grid item>
                    <IconButton>
                      <MenuIcon onClick={handleToggleMenu} />
                    </IconButton>
                    <IconLogo />
                  </Grid>
                  <Grid item>
                    <IconButton onClick={handleFilterClick}>
                      <IconFilter />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              {isFilterShown && (
                <Grid item>
                  <FilterTopPlanter
                    isOpen={isFilterShown}
                    onSubmit={filter => updateFilter(filter)}
                    filter={props.plantersState.filter}
                    onClose={handleFilterClick}
                  />
                </Grid>
              )}
            </Grid>
          </AppBar>
        </Grid>
        <Grid
          item
          className={classes.body}
          style={{
            marginTop: isFilterShown ? 100 : 50,
          }}
        >
          <Grid container>
            <Grid
              item
              style={{
                width: '100%',
              }}
            >
              <Grid container justify={'space-between'} className={classes.title}>
                <Grid item>
                  <Typography
                    variant="h5"
                    style={{
                      paddingTop: 20,
                    }}
                  >
                    Planters
                  </Typography>
                </Grid>
                <Grid item></Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row">
                {plantersItems}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isMenuShown && <Menu onClose={() => setMenuShown(false)} />}
      <Grid container className={classes.page} justify="flex-end" >
        <Pagination
          count={10}
          variant="outlined"
          shape="rounded"
          onChange={handlePageChange}
        />
      </Grid>
      <Detail open={isDetailShown} planter={planterDetail} onClose={() => setDetailShown(false)} />
    </React.Fragment>
  )
}

function Planter (props){
  const {
    planter
  } = props;
  const classes = useStyles(props);
  return(
      <div onClick={() => props.onClick()} className={clsx(classes.cardWrapper)} key={planter.id}>
        <Card id={`card_${planter.id}`} className={classes.card} 
          classes={{
            root: classes.planterCard,
          }}
        >
          <CardContent className={classes.cardContent}>
            {planter.imageUrl &&
              <CardMedia className={classes.cardMedia} image={planter.logoUrl} />
            }
            {!planter.imageUrl &&
              <CardMedia className={classes.cardMedia} >
                <Grid container className={classes.personBox} >
                  <Person className={classes.person} />
                </Grid>
              </CardMedia>
            }
          </CardContent>
          <CardActions className={classes.cardActions}>
            <Grid justify="flex-start" container >
              <Grid container direction="column">
                <Typography className={classes.name} >{planter.firstName} {planter.lastName}</Typography>
                <Typography>ID:{planter.id}</Typography>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </div>
  )
}
export {Planter};


const useDetailStyle = makeStyles(theme => ({
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

function Detail(props){
  const classes = useDetailStyle();
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
            <CardMedia className={classes.cardMedia} >
              <Grid container className={classes.personBox} >
                <Person className={classes.person} />
              </Grid>
            </CardMedia>
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
        </Grid>
      </Grid>
    </Drawer>
  )
}
export {Detail}

export default connect(
  //state
  (state) => ({
    plantersState: state.planters,
  }),
  //dispatch
  (dispatch) => ({
    plantersDispatch: dispatch.planters,
  })
)(Planters)
