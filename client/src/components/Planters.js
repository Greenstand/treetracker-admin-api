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

import Filter, { FILTER_WIDTH } from './Filter'
import FilterTop from './FilterTop'
import { MENU_WIDTH } from './common/Menu'
import FilterModel from '../models/Filter'
import { ReactComponent as TreePin } from '../components/images/highlightedPinNoStick.svg'
import IconLogo from './IconLogo'
import Menu from './common/Menu.js'
import Avatar from "@material-ui/core/Avatar";
import Person from "@material-ui/icons/Person";

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
    height: 305,
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
}))

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const Planters = (props) => {
  log.debug('render TreeImageScrubber...')
  const classes = useStyles(props)
  const [isFilterShown, setFilterShown] = React.useState(false)
  const [isMenuShown, setMenuShown] = React.useState(false)

  /*
   * effect to load page when mounted
   */
  useEffect(() => {
    log.debug('mounted')
    props.plantersDispatch.count()
    props.plantersDispatch.load({
      pageNumber: 1,
    })
  }, [])

  let plantersItems = props.plantersState.planters.map((planter) => {
    return (
      <Planter planter={planter} />
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
                  <FilterTop
                    isOpen={isFilterShown}
                    onSubmit={(filter) => {
                      props.verityDispatch.updateFilter(filter)
                    }}
                    filter={props.verityState.filter}
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
    </React.Fragment>
  )
}

function Planter (props){
  const {
    planter
  } = props;
  const classes = useStyles(props);
  return(
      <div className={clsx(classes.cardWrapper)} key={planter.id}>
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
            <Grid justify="flex-start" container>
              <Typography>{planter.firstName} {planter.lastName}</Typography>
              <Typography>ID:{planter.id}</Typography>
            </Grid>
          </CardActions>
        </Card>
      </div>
  )
}

export {Planter};

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
