import React from 'react'
import Data from './CaptureData.json';
import CandidateImgList from './CandidateImgList';


import { Typography, Box, Button, GridList, Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles'
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';



const useStyles = makeStyles({

    containerBox: {
        margin: '10px 20px 10px 20px',
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
        height: '100vh',
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

    // const [treeCount, setTreeCount] = useState([])
    const imageList = props.imageList
    const classes = useStyles()

    return (
      <div className={classes.imageScroll}>

        {imageList.map((item,i) => {

          return (  <div className={classes.containerBox}  key={item.id}>
               <Box className={classes.headerBox}>
                  <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="baseline"
                  >
                       <Box>
                        <Typography variant='h5' style={{padding: '10px'}}>Catures 1234</Typography>
                       </Box>
                       <Box><ZoomOutMapIcon style={{paddingRight: '10px', fontSize: '34px'}}/>
                       </Box>
                  </Grid>

             </Box>


                  <Box className={classes.gridList} cellHeight={160} cols={3}>
                  {item.imgSrc.map(imgSrc => {
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
                      >Same Tree
                      </Button>
                      <Button 
                        style={{margin: '0 0 20px 20px'}} 
                        variant='outlined' 
                        color='primary' 
                        startIcon={<ClearIcon />}
                      >Different Tree
                      </Button>
                  </div>
            </Box>


        </div>
        )}
        )}




     </div>

    )
}

export default CandidateImages


