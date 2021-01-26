import React from 'react'
import Data from './CaptureData.json';
import CandidateImgList from './CandidateImgList';


import { Typography, Box, Button, GridList, Grid} from '@material-ui/core';
import ZoomOutMapOutlinedIcon from '@material-ui/icons/ZoomOutMapOutlined';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import {makeStyles} from '@material-ui/core/styles'
import { sizing } from '@material-ui/system';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';


import Grower from './Grower'





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

    // imgBox: {
    //     paddingBottom: '20px'
    // },

    imgContainer: {
        width: '350px',
        height: 'auto',
        padding: '5px',
         objectFit: 'cover',
        paddingBottom: '10px',

        overFlow: 'hidde',
    },
    gridList: {
        // flexWrap: 'nowrap',
        //  transform: 'translateZ(0)',
        //  margin: '20px',
        padding: '10px',
        display: 'flex',
        overflowX: 'auto'
  },

   imageScroll: {
    height: '100vh',
    overflowY: 'scroll',

  }
})




// const imageList = Data.trees


const handleSkip = (id) => {
  console.log(id)
}

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

             {/* { Object.keys(item.imgSrc).map((imgList) =>(

                  <Box className={classes.gridList} cellHeight={160} cols={3}>

                      <Box style={{height: '300px'}}>
                      <img className={classes.imgContainer} src={item.imgList} />


                      </Box>
              </Box>
              )



                 )
             } */}
              <Box className={classes.gridList} cellHeight={160} cols={3}>

                      <Box style={{height: '300px'}}>
                      <img className={classes.imgContainer} src={item.imgSrc} />

                      </Box>
                      <Box style={{height: '300px'}}>
                      <img className={classes.imgContainer} src={item.imgSrc2} />

                      </Box>
              </Box>

                
              
                   {/* <Box className={classes.gridList} cellHeight={160} cols={3}>

                       <Box style={{height: '300px'}}>
                      <img className={classes.imgContainer} src={imgBox.imgSrc.img}/>
                       </Box>
               </Box> */}
             {/* <CandidateImgList/> */}

            <Box>
                  <div>
                      <Button style={{margin: '0 0 20px 20px'}} variant='contained' color='primary' startIcon={<CheckIcon />}>Same Tree</Button>
                      <Button style={{margin: '0 0 20px 20px'}} variant='outlined' color='primary' startIcon={<ClearIcon />}>Different Tree</Button>
                  </div>
            </Box>


        </div>
        )}
        )}




     </div>

    )
}

export default CandidateImages





// <div className={classes.containerBox}>
// <Box className={classes.headerBox}>

//         <Grid
//         container
//         direction="row"
//         justify="space-between"
//         alignItems="baseline"

//         >
//          <Box>
//             <Typography variant='h5' style={{padding: '10px'}}>Catures 1234</Typography>

//          </Box>
//            <Box><ZoomOutMapIcon style={{paddingRight: '10px', fontSize: '34px'}}/></Box>
//         </Grid>
// </Box>

// <Box>
//   <Box className={classes.gridList} cellHeight={160} cols={3}>
//     {treeList.map( img => {

//         return (
//           <Box style={{height: '300px'}}>
//           <img key={img.id} className={classes.imgContainer} src={img.imgSrc} />
//           </Box>

//         )
//     })}

//   </Box>
//       <div>
//           <Button style={{margin: '0 0 20px 20px'}} variant='contained' color='primary' startIcon={<CheckIcon />}>Same Tree</Button>
//           <Button style={{margin: '0 0 20px 20px'}} variant='outlined' color='primary' startIcon={<ClearIcon />}>Different Tree</Button>
//       </div>
//  </Box>
// </div>



