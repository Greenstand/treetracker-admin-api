import React, { useEffect, useReducer } from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button'; // replace with icons down the line
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

import { selectedHighlightColor } from '../common/variables.js';
import * as loglevel from 'loglevel';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Modal from '@material-ui/core/Modal';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconFilter from '@material-ui/icons/FilterList';
import Image from '@material-ui/icons/Image';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import Species from './Species';

import Filter, { FILTER_WIDTH } from './Filter';
import FilterTop from './FilterTop';
import { MENU_WIDTH } from './common/Menu';
import FilterModel from '../models/Filter';
import { ReactComponent as TreePin } from '../components/images/highlightedPinNoStick.svg';
import IconLogo		from './IconLogo';
import Menu from './common/Menu.js';
import CheckIcon from '@material-ui/icons/Check';
import Paper from '@material-ui/core/Paper';

const log = require('loglevel').getLogger('../components/TreeImageScrubber');

const SIDE_PANEL_WIDTH = 315;

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(2, 16, 4, 16),
    userSelect: 'none'
  },
  cardImg: {
    width: '100%',
    height: 'auto'
  },
  cardTitle: {
    color: '#f00'
  },
  card: {
    cursor: 'pointer',
    margin: '0.5rem'
  },
  cardCheckbox: {
    position: 'absolute',
    height: '1.2em',
    width: '1.2em',
    top: '0.2rem',
    left: '0.3rem',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardSelected: {
    backgroundColor: theme.palette.action.selected
  },
  cardContent: {
    padding: 0
  },
  selected: {
    border: `2px ${selectedHighlightColor} solid`
  },
  cardMedia: {
    height: '12rem'
  },
  cardWrapper: {
    '&:not($cardSelected) $card:hover': {
      margin: 0,
      height: '100%',
      '& $cardMedia': {
        height: '13rem'
      },
      transition: theme.transitions.create('height', {
        easing: theme.transitions.easing.easeInOut,
        duration: '0.3s'
      }),
    },
    position: 'relative',
    width: '30%',
    minWidth: 300,
    margin: 2
  },
  title: {
    padding: theme.spacing(2, 16)
  },
  snackbar: {
    bottom: 20
  },
  snackbarContent: {
    backgroundColor: theme.palette.action.active
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  button: {
    marginRight: '8px'
  },

  appBar: {
    width: `calc(100% - ${SIDE_PANEL_WIDTH}px)`,
    left: 0,
    right: 'auto',
  },
  sidePanel: {
  },
  drawerPaper: {
    width: SIDE_PANEL_WIDTH,
  },
  body: {
    width: `calc(100% - ${SIDE_PANEL_WIDTH}px)`,
  },
  sidePanelContainer: {
    padding: theme.spacing(2),
  },
  sidePanelItem: {
    marginTop: theme.spacing(1),
  },
  radioGroup: {
    flexDirection : 'row',
  },
  bottomLine: {
    borderBottom : '1px solid lightgray',
  },
  tooltip: {
    maxWidth: 'none',
  },

}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TreeImageScrubber = ({ getScrollContainerRef, ...props }) => {
  log.debug('render TreeImageScrubber...');
  log.debug('complete:', props.verityState.approveAllComplete);
  const classes = useStyles(props);
  const [complete, setComplete] = React.useState(0);
  const [isFilterShown, setFilterShown] = React.useState(false);
  const [isMenuShown, setMenuShown] = React.useState(false);
  const [dialog, setDialog] = React.useState({isOpen: false, tree: {}});

  /*
   * effect to load page when mounted
   */
  useEffect(() => {
    log.debug('mounted');
    props.verityDispatch.loadMoreTreeImages();
  }, []);

  /*
   * effect to set the scroll event
   */
  useEffect(() => {
    log.debug('verity state changed');
    //move add listener to effect to let it refresh at every state change
    let scrollContainerRef = getScrollContainerRef();
    const handleScroll = e => {
      if (
        scrollContainerRef &&
        Math.floor(scrollContainerRef.scrollTop) !==
          Math.floor(scrollContainerRef.scrollHeight) -
            Math.floor(scrollContainerRef.offsetHeight)
      ) {
        return;
      }
      props.verityDispatch.loadMoreTreeImages();
    };
    let isListenerAttached = false;
    if (
      scrollContainerRef &&
      //should not listen scroll when loading
      !props.verityState.isLoading
    ) {
      log.debug('attaching listener');
      scrollContainerRef.addEventListener('scroll', handleScroll);
      isListenerAttached = true;
    } else {
      log.debug('do not attach listener');
    }

    return () => {
      if (isListenerAttached) {
        scrollContainerRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [props.verityState]);

  /* to display progress */
  useEffect(() => {
    setComplete(props.verityState.approveAllComplete);
  }, [props.verityState.approveAllComplete]);

//  /* To update unverified tree count */
//  useEffect(() => {
//      props.verityDispatch.getTreeCount();
//  }, [props.verityState.treeImages]);

  function handleTreeClick(e, treeId) {
    e.stopPropagation();
    e.preventDefault();
    log.debug('click at tree:%d', treeId);
    props.verityDispatch.clickTree({
      treeId,
      isShift: e.shiftKey,
      isCmd: e.metaKey,
      isCtrl: e.ctrlKey
    });
  }

  function handleTreePinClick(e, treeId) {
    e.stopPropagation();
    e.preventDefault();
    log.debug('click at tree:%d', treeId);
    const url = `${process.env.REACT_APP_WEBMAP_DOMAIN}/?treeid=${treeId}`;
    window.open(url, '_blank').opener = null;
  }

  async function handleSubmit(approveAction){
    console.log('approveAction:', approveAction)
    //check selection
    if(props.verityState.treeImagesSelected.length === 0){
      window.alert('Please select some tree')
      return
    }
    /*
     * check species
     */
    const isNew = await props.speciesDispatch.isNewSpecies()
    if(isNew){
      const answer = await new Promise((resolve, reject) => {
        if(window.confirm(`The species ${props.speciesState.speciesInput} is a new one, create it?`)){
          resolve(true)
        }else{
          resolve(false)
        }
      })
      if(!answer){
        return
      }else{
        //create new species
        const species = await props.speciesDispatch.createSpecies()
      }
    }
    const speciesId = await props.speciesDispatch.getSpeciesId()
    if(speciesId){
        approveAction.speciesId = speciesId
        console.log('species id:', speciesId)
    }
    const result = await props.verityDispatch.approveAll({approveAction});
    if (result) {
      //if all trees were approved, then, load more
      if (
        props.verityState.treeImagesSelected.length ===
        props.verityState.treeImages.length
      ) {
        log.debug('all trees approved, reload');
        props.verityDispatch.loadMoreTreeImages();
      }
    } else {
      window.alert('sorry, failed to approve some picture');
    }
  }

  function handleDialog(e, tree){
    e.preventDefault();
    e.stopPropagation();
    setDialog({
      isOpen: true,
      tree,
    })
  }

  function handleDialogClose(){
    setDialog({
      isOpen: false,
      tree: {}
    })
  }

  function isTreeSelected(id){
    return props.verityState.treeImagesSelected.indexOf(id) >= 0
  }

  let treeImageItems = props.verityState.treeImages.map(tree => {
    if (tree.imageUrl) {
      return (
        <div
          className={clsx(
            classes.cardWrapper,
            isTreeSelected(tree.id)
              ? classes.cardSelected
              : undefined
          )} key={tree.id}
        >
          {isTreeSelected(tree.id) &&
            (<Paper
              className={classes.cardCheckbox}
              elevation={4}
            >
              <CheckIcon/>
            </Paper>)
          }
          <Card
            onClick={e => handleTreeClick(e, tree.id)}
            id={`card_${tree.id}`}
            className={classes.card}
            elevation={3}
          >
            <CardContent className={classes.cardContent}>
              <CardMedia className={classes.cardMedia} image={tree.imageUrl} />
            </CardContent>
            <CardActions className={classes.cardActions}>
              <Grid 
                justify='flex-end'
                container>
                <Grid item>
                  <Image
                    color='primary'
                    onClick={e => handleDialog(e, tree)}
                  />
                  <TreePin
                    width='25px'
                    height='25px'
                    title={`Open Webmap for Tree# ${tree.id}`}
                    onClick={e => {
                    handleTreePinClick(e, tree.id);
                    }}
                  />
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </div>
      );
    }
  });

  function handleFilterClick() {
    if (isFilterShown) {
      setFilterShown(false);
    } else {
      setFilterShown(true);
    }
  }

  function handleToggleMenu(){
    setMenuShown(!isMenuShown)
  }

  return (
    <React.Fragment>
      <Grid 
        container
        direction='column'
      >
        <Grid item>
          <AppBar
            color='default'
            className={classes.appBar}
          >
            <Grid container direction='column'>
              <Grid item>
                <Grid container justify='space-between'>
                  <Grid item>
                    <IconButton>
                      <MenuIcon onClick={handleToggleMenu}/>
                    </IconButton>
                    <IconLogo/>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={handleFilterClick}
                    >
                      <IconFilter />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              {isFilterShown &&
              <Grid item>
                <FilterTop
                  isOpen={isFilterShown}
                  onSubmit={filter => {
                    props.verityDispatch.updateFilter(filter);
                  }}
                  filter={props.verityState.filter}
                  onClose={handleFilterClick}
                />
              </Grid>
              }
            </Grid>
          </AppBar>
        </Grid>
        <Grid 
          item 
          className={classes.body}
          style={{
            marginTop: isFilterShown? 100:50,
          }}
        >
          <Grid container>
            <Grid
              item
              style={{
                width: '100%',
              }}
            >
              <Grid
                container
                justify={'space-between'}
                className={classes.title}
              >
                <Grid item>
                  <Typography
                    variant='h5'
                    style={{
                      paddingTop: 20
                    }}
                  >
                  {false /* close counter*/&& props.verityState.treeCount} trees to verify
                  </Typography>
                </Grid>
                <Grid item>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              style={{
                width: '100%'
              }}
            >
              <section className={classes.wrapper}>{treeImageItems}</section>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <SidePanel
        onSubmit={handleSubmit}
      />
      {isMenuShown &&
        <Menu
          onClose={() => setMenuShown(false)}
        />
      }
      {props.verityState.isApproveAllProcessing && (
        <AppBar
          position='fixed'
          style={{
            zIndex: 10000
          }}
        >
          <LinearProgress
            color='primary'
            variant='determinate'
            value={complete}
          />
        </AppBar>
      )}
      {props.verityState.isApproveAllProcessing && (
        <Modal open={true}>
          <div></div>
        </Modal>
      )}
      {false /* close undo */&& !props.verityState.isApproveAllProcessing && !props.verityState.isRejectAllProcessing &&
        props.verityState.treeImagesUndo.length > 0 && (
          <Snackbar
            open
            autoHideDuration={15000}
            ContentProps={{
              className: classes.snackbarContent,
              'aria-describedby': 'snackbar-fab-message-id'
            }}
            message={
              <span id='snackbar-fab-message-id'>
                You have { props.verityState.isBulkApproving ? ' approved ' : ' rejected '}
                {props.verityState.treeImagesUndo.length}{' '}
                trees
              </span>
            }
            color='primary'
            action={
              <Button
                color='inherit'
                size='small'
                onClick={async () => {
                  const result = await props.verityDispatch.undoAll();
                  log.log('finished');
                }}
              >
                Undo
              </Button>
            }
            className={classes.snackbar}
          />
        )}
      <Dialog
        open={dialog.isOpen}
        TransitionComponent={Transition}
      >
        <DialogTitle>Tree Detail</DialogTitle>
        <DialogContent>
          <img src={dialog.tree.imageUrl} />
        </DialogContent>
        <DialogActions>
          <Grid container justify="space-between" >
            <Grid item>
              <Typography variant='body2' color="primary" gutterBottom>
                Tree #{dialog.tree.id}, 
                Planter #{dialog.tree.planterId}, 
                Device #{dialog.tree.deviceId}
              </Typography>
              <Typography variant='body2' color="primary" gutterBottom>
                Created time: {dialog.tree.timeCreated}, 
              </Typography>
            </Grid>
            <Grid item>
              <Button onClick={handleDialogClose}>Close</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
};

function SidePanel(props){
  const classes = useStyles(props);
  const [switchApprove, handleSwitchApprove] = React.useState(0)
  const [morphology, handleMorphology] = React.useState('seedling')
  const [age, handleAge] = React.useState('new_tree')
  const [captureApprovalTag, handleCaptureApprovalTag] = React.useState('simple_lead')
  const [rejectionReason, handleRejectionReason] = React.useState('not_tree')
  const speciesRef = React.useRef(null)

  function handleSubmit(){
    const approveAction = switchApprove === 0?
      {
        isApproved: true,
        morphology,
        age,
        captureApprovalTag,
      }
    :
      {
        isApproved: false,
        rejectionReason,
      }
    props.onSubmit(approveAction)
  }

  return (
    <Drawer
      variant='permanent'
      anchor='right'
      className={classes.sidePanel}
      classes={{
        paper: classes.drawerPaper
      }}
      elevation={11}
    >
      <Grid container direction={'column'} className={classes.sidePanelContainer}>
        <Grid>
          <Typography variant='h5' >Tags</Typography>
        </Grid>
        <Grid className={`${classes.bottomLine} ${classes.sidePanelItem}`}>
          <RadioGroup value={morphology} className={classes.radioGroup}>
            <FormControlLabel 
              value='seedling' 
              onClick={() => handleMorphology('seedling')} 
              control={<Radio/>} 
              label='Seedling' />
            <FormControlLabel 
              value='direct_seedling' 
              control={<Radio/>} 
              onClick={() => handleMorphology('direct_seedling')}
              label='Direct seeding' />
            <FormControlLabel 
              onClick={() => handleMorphology('fmnr')}
              value='fmnr' control={<Radio/>} label='Pruned/tied(FMNR)' />
          </RadioGroup>
        </Grid>
        <Grid className={`${classes.bottomLine} ${classes.sidePanelItem}`}>
          <RadioGroup value={age} className={classes.radioGroup}>
            <FormControlLabel 
              onClick={() => handleAge('new_tree')}
              value='new_tree' control={<Radio/>} label='New tree(s)' />
            <FormControlLabel 
              onClick={() => handleAge('over_two_years')}
              value='over_two_years' control={<Radio/>} label='> 2 years old' />
          </RadioGroup>
        </Grid>
        {/*
        <Grid className={`${classes.bottomLine} ${classes.sidePanelItem}`}>
          <RadioGroup className={classes.radioGroup}>
            <FormControlLabel disabled value='Create token' control={<Radio/>} label='Create token' />
            <FormControlLabel disabled value='No token' control={<Radio/>} label='No token' />
          </RadioGroup>
        </Grid>
        */}
        <Grid>
          <Typography variant='h6'>Species(if known)</Typography>
          <Species
            ref={speciesRef}
          />
        </Grid>
        <Grid className={`${classes.bottomLine} ${classes.sidePanelItem}`}>
          <Tabs 
            indicatorColor='primary'
            textColor='primary'
            variant='fullWidth'
            value={switchApprove}
          >
            <Tab label='APPROVE' 
              id='full-width-tab-0'
              aria-controls='full-width-tabpanel-0'
              onClick={() => handleSwitchApprove(0)}
            />
            <Tab 
              label='REJECT'
              id='full-width-tab-0'
              aria-controls='full-width-tabpanel-0'
              onClick={() => handleSwitchApprove(1)}
            />
          </Tabs>
          {switchApprove === 0 &&
            <RadioGroup
              value={captureApprovalTag}
            >
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('simple_lead')}
                value='simple_lead' control={<Radio/>} label='Simple leaf' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('complex_leaf')}
                value='complex_leaf' control={<Radio/>} label='Complex leaf' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('acacia_like')}
                value='acacia_like' control={<Radio/>} label='Acacia-like' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('conifer')}
                value='conifer' control={<Radio/>} label='Conifer' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('fruit')}
                value='fruit' control={<Radio/>} label='Fruit' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('mangrove')}
                value='mangrove' control={<Radio/>} label='Mangrove' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('plam')}
                value='plam' control={<Radio/>} label='Palm' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('timber')}
                value='timber' control={<Radio/>} label='Timber' />
            </RadioGroup>
          }
          {switchApprove === 1 &&
            <RadioGroup
              value={rejectionReason}
            >
              <FormControlLabel 
                onClick={() => handleRejectionReason('not_tree')}
                value='not_tree' control={<Radio/>} label='Not a tree' />
              <FormControlLabel 
                onClick={() => handleRejectionReason('unapproved_tree')}
                value='unapproved_tree' control={<Radio/>} label='Not an approved tree' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('blurry_image')}
                value='blurry_image' control={<Radio/>} label='Blurry photo' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('dead')}
                value='dead' control={<Radio/>} label='Dead' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('duplicate_image')}
                value='duplicate_image' control={<Radio/>} label='Duplicate photo' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('flag_user')}
                value='flag_user' control={<Radio/>} label='Flag user!' />
              <FormControlLabel 
                onClick={() => handleCaptureApprovalTag('needs_contact_or_review')}
                value='needs_contact_or_review' control={<Radio/>} label='Flag tree for contact/review' />
            </RadioGroup>
          }
        
        </Grid>
        <Grid className={`${classes.sidePanelItem}`}>
          <TextField placeholder='Note(optional)' ></TextField>
        </Grid>
        <Grid className={`${classes.sidePanelItem}`}>
          <Button onClick={handleSubmit} color='primary' >SUBMIT</Button>
        </Grid>
      </Grid>
    </Drawer>
  )
}


export default connect(
  //state
  state => ({
    verityState: state.verity,
    speciesState: state.species,
  }),
  //dispatch
  dispatch => ({
    verityDispatch: dispatch.verity,
    speciesDispatch: dispatch.species,
  })
)(TreeImageScrubber);
