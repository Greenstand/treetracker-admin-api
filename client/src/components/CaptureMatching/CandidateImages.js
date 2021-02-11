import React, {useState, useRef} from 'react'

import { Typography, Box, Button, GridList, Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';



const useStyles = makeStyles({

    containerBox: {
        margin: '25px 20px 10px 20px',
        paddingTop: '20px',
        paddingBottom: '10px',
       background: '#fff',
       borderRadius: '4px',


    },

    headerBox: {
        display: 'flex',
        flexDirection: 'spaceBetween'
    },


    imgContainer: {
        width: '350px',
        height: 'auto',
        padding: '5px',
         objectFit: 'cover',
        paddingBottom: '10px',
        overFlow: 'hidde',
    },
    gridList: {

         padding: '10px',
         display: 'flex',
         flexDirection: 'row',
         overflowX: 'auto'
  },

        imageScroll: {
        // height: '100vh',
        height: '830px',
        overflowY: 'scroll',


  }
})


// Get current Date
    let showdate = new Date();
    let date = (showdate.getMonth() + 1) + '-' + showdate.getDate() + '-' + showdate.getFullYear();

// Get current time
    let showTime = new Date()
    let time = showTime.getHours() + ':' + showTime.getMinutes() + ':' + showTime.getSeconds();



function CandidateImages(props) {

    const classes = useStyles()

    const imageList = props.imageList
    const [showBox, setShowBox] = useState(true)
    const currentEl = useRef(null)

  // Different tree toggle Image Box
    const hideImgBox = () => {
     setShowBox(!showBox)

    }

    const showImgBox = () => {
      setShowBox(true)
    }


    return (
      <div className={classes.imageScroll}>

        {imageList.map((item,i) => {

          return (  <div className={classes.containerBox}  key={item.id}>
               <Box ref={currentEl} className={classes.headerBox}>
                  <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="baseline"
                    onClick={() => showImgBox()}
                  >
                       <Box>
                        <Typography variant='h5' style={{padding: '10px'}}>Captures 1234</Typography>
                       </Box>
                       <Box><ZoomOutMapIcon style={{paddingRight: '10px', fontSize: '34px'}}/>
                       </Box>
                  </Grid>

             </Box>
              {showBox ?
            <div>
                  <Box className={classes.gridList} cellHeight={160} cols={3}>
                  {item.imgSrc.map((imgSrc) => {
                return(
                  <Box style={{height: '300px'}}>
                  <img className={classes.imgContainer} src={imgSrc.img} />

                  </Box>
                 )
                })}
          </Box>

          <Box>
                  <div>
                      <Button
                        style={{margin: '0 0 20px 20px'}}
                        variant='contained'
                        color='primary'
                        startIcon={<CheckIcon />}
                        onClick={() => props.deleteDataHandler(item.id)}
                      >Same Tree
                      </Button>
                      <Button
                        style={{margin: '0 0 20px 20px'}}
                        id={item.id}
                        variant='outlined'
                        color='primary'
                        startIcon={<ClearIcon />}
                        onClick={() => hideImgBox(item)}
                      >Different Tree
                      </Button>
                  </div>
            </Box>

      </div>

    : null }

   </div>
        )}
        )}


 </div>

    )
}

export default CandidateImages


