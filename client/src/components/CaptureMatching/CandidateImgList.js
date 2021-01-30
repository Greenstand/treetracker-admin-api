import React from 'react'
import Data from './CaptureData.json';

import {makeStyles} from '@material-ui/core/styles'
import { Typography, Box, Button, GridList, Grid} from '@material-ui/core';



const useStyles = makeStyles({
    gridList: {
      padding: '10px',
      display: 'flex',
      overflowX: 'auto'
  },
  imgContainer: {
  width: '350px',
  height: 'auto',
  padding: '5px',
   objectFit: 'cover',
  paddingBottom: '10px',

  overFlow: 'hidde',
}
  })


function CandidateImgList() {

  const imgList = Data.trees.imgSrc

  const classes = useStyles()


  return (
    <div>
        <Box className={classes.gridList} cellHeight={160} cols={3}>
                {imgList.map( (img, i) => {

                    return (
                      <Box style={{height: '300px'}}>
                      <img className={classes.imgContainer} src={img.img} />
                      </Box>

                    )
                })}

              </Box>
    </div>
  )
}

export default CandidateImgList
