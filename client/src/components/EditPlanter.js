import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  TextField,
  CircularProgress,
} from '@material-ui/core'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons'
import api from '../api/planters'

const IMAGE_CARD_SIZE = 200
const NUM_IMAGE_CARDS = 3

const useStyle = makeStyles(theme => ({
  imageScroller: {
    width: `${IMAGE_CARD_SIZE * NUM_IMAGE_CARDS}px`,
    height: `${IMAGE_CARD_SIZE}px`,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    overflowX: 'auto',
    marginBottom: theme.spacing(4),
    justifyContent: 'center',
  },
  planterImageCard: {
    width: `calc(${IMAGE_CARD_SIZE}px - ${theme.spacing(4)}px)`,
    height: '100%',
    margin: theme.spacing(2),
    cursor: 'pointer',
    position: 'relative',
  },
  planterImage: {
    width: '100%',
    height: '100%',
  },
  imageCheck: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
  },
  scrollLeft: {
    position: 'absolute',
    left: 0,
  },
  scrollRight: {
    position: 'absolute',
    right: 0,
  },
  textInput: {
    margin: theme.spacing()
  },
}));

const MAX_IMAGES_INCREMENT = 20

function EditPlanter(props) {
  
  const classes = useStyle()
  const { isOpen, planter, onClose } = props

  const [planterImages, setPlanterImages] = useState([])
  const [planterUpdate, setPlanterUpdate] = useState(null)
  const [saveInProgress, setSaveInProgress] = useState(false)
  const [maxImages, setMaxImages] = useState(MAX_IMAGES_INCREMENT)

  useEffect(() => {
    async function loadPlanterImages() {
      if (planter?.id) {
        const selfies = await api.getPlanterSelfies(planter.id)

        // TODO: Remove duplicates
        setPlanterImages([
          ...(planter?.imageUrl ? [planter.imageUrl] : []),
          ...selfies.filter(img => img !== planter.imageUrl),
        ])
      }
    }

    setPlanterUpdate(null)
    setMaxImages(MAX_IMAGES_INCREMENT)
    loadPlanterImages()
  }, [planter])

  async function handleSave() {
    if (planterUpdate) {
      setSaveInProgress(true)
      // TODO handle errors
      await api.updatePlanter(planter.id, planterUpdate)
      setSaveInProgress(false)
    }
    onClose()
  }

  function handleCancel() {
    onClose()
  }

  function handleChange(key, val) {
    let newPlanter = {...planterUpdate}
    newPlanter[key] = val
    setPlanterUpdate(newPlanter)
  }

  function loadMoreImages() {
    setMaxImages(maxImages + MAX_IMAGES_INCREMENT)
  }

  function setPlanterImage(img) {
    setPlanterUpdate({
      ...planterUpdate,
      imageUrl: img,
    })
  }

  return(
    <Dialog open={isOpen} aria-labelledby="form-dialog-title" maxWidth={false}>
      <DialogTitle id="form-dialog-title">Edit Planter</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          <Grid item className={classes.imageScroller}>
            {planterImages.slice(0,maxImages).map((img, idx) =>
              <Card key={`${idx}_${img}`} className={classes.planterImageCard} onClick={(e) => setPlanterImage(img)}>
                <CardMedia image={img} title={img} className={classes.planterImage}/>
                {(img === planterUpdate?.imageUrl || (!planterUpdate?.imageUrl && img === planter.imageUrl)) &&
                  <CheckCircle color="primary" className={classes.imageCheck} />
                }
              </Card>
            )}
            {maxImages < planterImages.length && <Button onClick={loadMoreImages}>Load more</Button>}
          </Grid>
          {/* <Fab className={classes.scrollLeft}>
            <ChevronLeft />
          </Fab>
          <Fab className={classes.scrollRight}>
            <ChevronRight />
          </Fab> */}
          <Grid item container direction="row">
            <Grid item>
              <TextField
                className={classes.textInput}
                id="firstName"
                label="First Name"
                type="text"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {handleChange('firstName', e.target.value)}}
                value={planterUpdate?.firstName || planter.firstName}
              />
            </Grid>
            <Grid item>
              <TextField
                className={classes.textInput}
                id="lastName"
                label="Last Name"
                type="text"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {handleChange('lastName', e.target.value)}}
                value={planterUpdate?.lastName || planter.lastName}
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!planterUpdate || saveInProgress}>
          {saveInProgress ? <CircularProgress size={21} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default (EditPlanter)