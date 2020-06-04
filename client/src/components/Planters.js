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
import TablePagination from '@material-ui/core/TablePagination'

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
import Toolbar from '@material-ui/core/Toolbar'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TextField from '@material-ui/core/TextField'
import Species from './Species'
import Close from "@material-ui/icons/Close";

import FilterTopPlanter from './FilterTopPlanter'
import FilterPlanter from '../models/FilterPlanter'
import IconLogo from './IconLogo'
import Avatar from "@material-ui/core/Avatar";
import Person from "@material-ui/icons/Person";
import Divider from "@material-ui/core/Divider";
import Navbar from "./Navbar";

const log = require('loglevel').getLogger('../components/Planters')

const useStyles = makeStyles((theme) => ({
  outer: {
    height: '100vh',
    flex: 1,
    flexWrap: 'nowrap',
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
  placeholderCard: {
    pointerEvents: 'none',
    background: '#eee',
    '& *': {
      opacity: 0,
    },
    border: 'none',
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
  sidePanel: {},
  body: {
    width: '100%',
    overflow: 'hidden auto',
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
    padding: theme.spacing(2, 16),
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
  log.debug('render Planters...')
  const classes = useStyles(props)
  const [isFilterShown, setFilterShown] = React.useState(false)
  const [isDetailShown, setDetailShown] = React.useState(false)
  const [planterDetail, setPlanterDetail] = React.useState({});

  /*
   * effect to load page when mounted
   */
  useEffect(() => {
    log.debug('mounted')
    props.plantersDispatch.count()
    props.plantersDispatch.load({
      pageNumber: 0,
      filter: new FilterPlanter(),
    })
  }, [])

  useEffect(() => {
    props.plantersDispatch.load({
      pageNumber: 0,
      filter: props.plantersState.filter,
    });
  }, [props.plantersState.pageSize])

  useEffect(() => {
    props.plantersDispatch.count({
      filter: props.plantersState.filter,
    })
  }, [props.plantersState.filter])

  function handlePlanterClick(planter){
    setDetailShown(true);
    setPlanterDetail(planter);
  }

  const placeholderPlanters = Array(props.plantersState.pageSize).fill().map((_, index) => {
    return {
      id: index,
      placeholder: true,
    };
  });

  let plantersItems = (props.plantersState.isLoading ?
                       placeholderPlanters :
                       props.plantersState.planters
                      ).map((planter) => {
    return (
      <Planter
        onClick={() => handlePlanterClick(planter)}
        key={planter.id} 
        planter={planter}
        placeholder={planter.placeholder}/>
    )
  })

  function handleFilterClick() {
    if (isFilterShown) {
      setFilterShown(false)
    } else {
      setFilterShown(true)
    }
  }

  function handlePageChange(e, page){
    props.plantersDispatch.load({
      pageNumber: page,
      filter: props.plantersState.filter,
    });
  }

  function handleChangePageSize(e, option){
    props.plantersDispatch.changePageSize({pageSize: option.props.value})
  }

  function updateFilter(filter){
    props.plantersDispatch.load({
      pageNumber: 0,
      filter,
    });
  }

  const pagination = (
    <TablePagination
      rowsPerPageOptions={[24, 48, 96]}
      component="div"
      count={props.plantersState.count}
      rowsPerPage={props.plantersState.pageSize}
      page={props.plantersState.currentPage}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handleChangePageSize}
      labelRowsPerPage="Planters per page:"
    />
  );

  return (
    <React.Fragment>
      <Grid container direction="column" className={classes.outer}>
        <Grid item>
          <Navbar
            buttons={[
              <IconButton onClick={handleFilterClick}>
                <IconFilter />
              </IconButton>
            ]}
          >
            {isFilterShown &&
              <FilterTopPlanter
                isOpen={isFilterShown}
                onSubmit={filter => updateFilter(filter)}
                filter={props.plantersState.filter}
                onClose={handleFilterClick}
              />
            }
          </Navbar>
        </Grid>
        <Grid
          item
          className={classes.body}
        >
          <Grid container>
            <Grid
              item
              style={{
                width: '100%',
              }}
            >
              <Grid container justify='space-between' alignItems='center' className={classes.title}>
                <Grid item>
                  <Typography variant='h5'>
                    Planters
                  </Typography>
                </Grid>
                <Grid item>{pagination}</Grid>
              </Grid>
            </Grid>
            <Grid item container direction='row' justify='center'>
              {plantersItems}
            </Grid>
          </Grid>
          <Grid container className={classes.page} justify='flex-end' >
            {pagination}
          </Grid>
        </Grid>
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
        <Card
          id={`card_${planter.id}`}
          className={clsx(classes.card, props.placeholder && classes.placeholderCard)} 
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
