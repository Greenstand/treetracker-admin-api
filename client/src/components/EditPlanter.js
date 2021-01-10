import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
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
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons'
import api from '../api/planters'

const IMAGE_CARD_SIZE = 150
const NUM_IMAGE_CARDS = 3
const SCROLL_BUTTON_SIZE = 48

const useStyle = makeStyles(theme => ({
  container: {
    position: 'relative',
    padding: theme.spacing(0, 4),
  },
  imageScroller: {
    width: `${IMAGE_CARD_SIZE * NUM_IMAGE_CARDS}px`,
    height: `${IMAGE_CARD_SIZE + 16}px`,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    overflowX: 'auto',
    marginBottom: theme.spacing(4),
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  planterImageCard: {
    height: '100%',
    margin: theme.spacing(1.5),
    width: `${IMAGE_CARD_SIZE - theme.spacing(3)}px`,
    cursor: 'pointer',
    position: 'relative',
    transition: 'box-shadow 0.1s ease-in-out',
  },
  planterImage: {
    width: '100%',
    height: '100%',
    transition: 'box-shadow 0.1s ease-in-out',
  },
  selectedImage: {
    boxShadow: `inset 0 0 0 ${theme.spacing()}px ${theme.palette.primary.main}`,
  },
  imageCheck: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
  },
  scrollButton: {
    height: `${SCROLL_BUTTON_SIZE}px`,
    width: `${SCROLL_BUTTON_SIZE}px`,
    position: 'absolute',
    top: `${IMAGE_CARD_SIZE/2 - SCROLL_BUTTON_SIZE/2}px`
  },
  scrollLeft: {
    left: `-${SCROLL_BUTTON_SIZE/4}px`,
  },
  scrollRight: {
    right: `-${SCROLL_BUTTON_SIZE/4}px`,
  },
  textInput: {
    margin: theme.spacing(2,1),
    flexGrow: 1,
  },
}));

const MAX_IMAGES_INCREMENT = 20

const EditPlanter = (props) => {
  
  const classes = useStyle()
  const { isOpen, planter, onClose } = props
  const imageScrollerRef = useRef(null);

  const [planterImages, setPlanterImages] = useState([])
  const [planterUpdate, setPlanterUpdate] = useState(null)
  const [loadingPlanterImages, setLoadingPlanterImages] = useState(false)
  const [saveInProgress, setSaveInProgress] = useState(false)
  const [maxImages, setMaxImages] = useState(MAX_IMAGES_INCREMENT)

  useEffect(() => {
    async function loadPlanterImages() {
      if (planter?.id) {
        setLoadingPlanterImages(true)
        const selfies = await api.getPlanterSelfies(planter.id)
        setLoadingPlanterImages(false)

        setPlanterImages([
          ...(planter.imageUrl ? [planter.imageUrl] : []),
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
      await props.plantersDispatch.updatePlanter({id: planter.id, ...planterUpdate})
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

  function getValue(attr) {
    // Ensure empty strings are not overlooked
    if (planterUpdate?.[attr] != null) {
      return planterUpdate[attr]
    } else if (planter[attr] != null) {
      return planter[attr]
    }
    return ''
  }

  function scrollImagesLeft() {
    scrollImages(-NUM_IMAGE_CARDS)
  }

  function scrollImagesRight() {
    scrollImages(NUM_IMAGE_CARDS)
  }

  function scrollImages(numImages) {
    const startPos = Math.round(imageScrollerRef.current.scrollLeft/IMAGE_CARD_SIZE) * IMAGE_CARD_SIZE
    imageScrollerRef.current.scrollTo({
      top: 0,
      left: startPos + numImages*IMAGE_CARD_SIZE,
      behavior: 'smooth'
    })
  }

  function isImageSelected(img) {
    return img === planterUpdate?.imageUrl || (!planterUpdate?.imageUrl && img === planter.imageUrl)
  }

  const inputs = [[
    {
      attr: 'firstName',
      label: 'First Name',
    },{
      attr: 'lastName',
      label: 'Last Name',
    },
  ],[
    {
      attr: 'email',
      label: 'Email Address',
      type: 'email'
    },
  ],[
    {
      attr: 'phone',
      label: 'Phone Number',
      type: 'tel'
    },
  ]]

  // TODO separate image scroller into a function component
  return(
    <Dialog open={isOpen} aria-labelledby="form-dialog-title" maxWidth={false}>
      <DialogTitle id="form-dialog-title">Edit Planter</DialogTitle>
      <DialogContent>
        <Grid container direction="column" className={classes.container}>
          <Grid item className={classes.imageScroller} ref={imageScrollerRef}>
            {loadingPlanterImages ? <CircularProgress/> :
              (planterImages.length ? 
                planterImages.slice(0, maxImages).map((img, idx) =>
                  <Card key={`${idx}_${img}`} className={classes.planterImageCard}
                        onClick={() => setPlanterImage(img)} raised={isImageSelected(img)}>
                    <CardMedia image={img} title={img}
                               className={`${classes.planterImage} ${isImageSelected(img) && classes.selectedImage}`}/>
                  </Card>
                )
              : 'No planter images available')
            }
            {maxImages < planterImages.length && <Button onClick={loadMoreImages}>Load more</Button>}
          </Grid>
          {planterImages.length > NUM_IMAGE_CARDS &&
            <React.Fragment>
              <Fab className={`${classes.scrollButton} ${classes.scrollLeft}`} onClick={scrollImagesLeft}>
                <ChevronLeft />
              </Fab>
              <Fab className={`${classes.scrollButton} ${classes.scrollRight}`} onClick={scrollImagesRight}>
                <ChevronRight />
              </Fab>
            </React.Fragment>
          }
          {inputs.map((row, rowIdx) => (
            <Grid item container direction="row" key={rowIdx}>
              {row.map((input, colIdx) => (
                <TextField
                  key={`${rowIdx}_${colIdx}`}
                  className={classes.textInput}
                  id={input.attr}
                  label={input.label}
                  type={input.type || 'text'}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => {handleChange(input.attr, e.target.value)}}
                  value={getValue(input.attr)}
                />
              ))}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary"
                disabled={!planterUpdate || saveInProgress}>
          {saveInProgress ? <CircularProgress size={21} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export {EditPlanter}

export default connect(
  (state) => ({
    plantersState: state.planters,
  }),
  (dispatch) => ({
    plantersDispatch: dispatch.planters,
  }),
)(EditPlanter)
