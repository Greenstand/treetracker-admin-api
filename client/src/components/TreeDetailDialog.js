import React, { Fragment, useRef, useState, useEffect } from 'react'

import compose from 'recompose/compose'
import { connect } from 'react-redux'

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'

import FileCopy from '@material-ui/icons/FileCopy'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles((theme) => ({
  chipRoot: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}))

function TreeDetailDialog(props) {
  const { open, TransitionComponent, onClose, tree } = props

  const [ snackbarOpen, setSnackbarOpen ] = useState(false)
  const [ snackbarLabel, setSnackbarLabel ] = useState('')
  const [ renderTree, setRenderTree ] = useState(tree)
  const classes = useStyles();
  const textAreaRef = useRef(null);

  useEffect(() => {
    props.getTreeAsync(props.tree.id)
  }, [props.tree])

  useEffect(() => {
    if (props.fullTree.id) {
      setRenderTree(props.fullTree)
      if (props.fullTree.speciesId && !props.fullTree.species) {
        // This aggregation should ideally be done on the server side
        props.getSpeciesById(props.fullTree.speciesId)
      }
    } else {
      setRenderTree(props.tree)
    }
  }, [props.fullTree, props.tree])

  useEffect(() => {
    setRenderTree({...renderTree, species: props.species})
  }, [props.species])

  function handleClose() {
    props.clearTree()
    props.onClose()
  }
  
  function Tags(props) {
    const { tree } = props
    const treeTags = [
      tree.morphology,
      tree.age,
      tree.captureApprovalTag,
      tree.rejectionReason,
    ]
    .filter(tag => !!tag)

    const dateCreated = new Date(Date.parse(tree.timeCreated))
    function confirmCopy(label) {
      setSnackbarOpen(false)
      setSnackbarLabel(label)
      setSnackbarOpen(true)
    }

    function handleSnackbarClose(event, reason) {
      if (reason === 'clickaway') {
        return 
      }
      setSnackbarOpen(false)
    }

    function CopyButton(props) {
      const { value, label } = props

      return (
        <IconButton
          title='Copy to clipboard'
          onClick={(e) => {
            navigator.clipboard.writeText(value)
            confirmCopy(label)
          }}
        >
        <FileCopy fontSize='small'/>
      </IconButton>
      )
    }

    return (
      <Grid item container direction='column' spacing={4}>
        <Grid item>
          <Typography color='primary' variant='h6'>
            {`Tree ${tree.id}`}
            <CopyButton label='Tree ID' value={tree.id}/>
          </Typography>
        </Grid>
        <Divider/>
        {[
          { label: 'Planter ID', value: tree.planterId, copy: true },
          { label: 'Planter Identifier', value: tree.planterIdentifier, copy: true },
          { label: 'Device ID', value: tree.deviceId, copy: true },
          { label: 'Approved', value: tree.isApproved ? 'true' : 'false' },
          { label: 'Active', value: tree.active ? 'true' : 'false' },
          { label: 'Status', value: tree.status },
          { label: 'Species', value: tree.species },
          { label: 'Created', value: dateCreated.toLocaleString() },
        ].map(item =>
          <Fragment>
            <Grid item key={item.label}>
              <Typography variant='subtitle1'>{item.label}</Typography>
              <Typography variant='body1'>
                {item.value || '---'}
                {item.value && item.copy &&
                  <CopyButton label={item.label} value={item.value}/>
                }
              </Typography>
            </Grid>
            <Divider/>
          </Fragment>
        )}
        <Grid item>
          <Typography variant='subtitle1'>
            Tags
          </Typography>
          {
            treeTags.length === 0 ? <Typography variant='body1'>none</Typography> :
            <div className={classes.chipRoot}>
              {treeTags.map(tag => <Chip key={tag} label={tag} className={classes.chip}/>)}
            </div>
          }
        </Grid>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          key={snackbarLabel.length ? snackbarLabel : undefined}
          open={snackbarOpen} 
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          message={`${snackbarLabel} copied to clipboard`}
          color='primary'
          action={
            <Fragment>
              <IconButton size="small" aria-label="close" onClick={handleSnackbarClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Fragment>
          }
        />
      </Grid>
    )
  } 

  return (
    <Dialog
      open={open}
      TransitionComponent={TransitionComponent}
      onClose={handleClose}
      maxWidth='xl'
    >
      <DialogContent>
        <Grid container spacing={4} wrap='nowrap'>
          <Grid item>
            <img alt={`Tree ${renderTree}`} style={{maxWidth: '100%'}} src={renderTree.imageUrl} />
          </Grid>
          <Grid item style={{minWidth: '240px'}} spacing={2}>
            <Grid container direction='row' spacing={4}>
              <Tags tree={renderTree}/>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions justify='center'>
        <Button onClick={handleClose} color='primary'>Close</Button>
      </DialogActions>
      <textarea ref={textAreaRef} hidden/>
    </Dialog>
  )
}

const mapState = (state) => ({
  fullTree: state.trees.tree,
  species: state.species.speciesById,
})

const mapDispatch = (dispatch) => ({
  getTreeAsync: (id) => dispatch.trees.getTreeAsync(id),
  clearTree: () => dispatch.trees.getTree({}),
  getSpeciesById: (id) => dispatch.species.getSpeciesById(id),
})

export default compose(
  connect(mapState, mapDispatch)
)(TreeDetailDialog)
