import React,{useState, useEffect} from 'react'
import Data from './ImageData.json';
import axios from 'axios';
// import Pagination from './Pagination'

import { Typography, Box, Button, Grid} from '@material-ui/core';
import ZoomOutMapOutlinedIcon from '@material-ui/icons/ZoomOutMapOutlined';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import {makeStyles} from '@material-ui/core/styles'
import { sizing } from '@material-ui/system';


import Grower from './Grower'



const useStyles = makeStyles({
    containerBox: {
        margin: '20px 20px 10px 40px',
        paddingTop: '30px',
       background: '#fff',
       borderRadius: '4px'

    },

    headerBox: {
        display: 'flex',
        flexDirection: 'spaceBetween'
    },

    // imgBox: {
    //     paddingBottom: '20px'
    // },

    imgContainer: {
        width: '100%',
        height: '77vh',
        objectFit: 'cover',
        marginTop: '20px',
        // paddingBottom: '10px',

        // backgroundSize: 'cover'
    }
})






// const treeList = Data.catptureImages


const handleSkip = (id) => {
  console.log(id)
}

// Get current Date
    let showdate = new Date();
    let date = (showdate.getMonth() + 1) + '-' + showdate.getDate() + '-' + showdate.getFullYear();

// Get current time
    let showTime = new Date()
    let time = showTime.getHours() + ':' + showTime.getMinutes() + ':' + showTime.getSeconds();



function CaptureImage(props) {

    const {
        imageData, 
        loading, 
        currentPage,
        noOfPages,
        handleChange,
        captureApiFetch, 
        imgPerPage, 
        skipCapture
    } = props

     const classes = useStyles()

    return (

        <div className={classes.containerBox}>
    
            <Box className={classes.headerBox}>

                    <Grid
                    container
                    direction="row"
                    justify="space-around"
                    // alignItems="baseline"
                    >
                     <Box style={{marginTop: '15px' }}>
                        <Typography variant='h5'>Catures 1234</Typography>
                        <Box>
                            <AccessTimeIcon/>
                            <Typography variant='p'>{date + ', ' + time}</Typography>
                        </Box>

                        <Box>
                            <LocationOnOutlinedIcon/>
                            <Typography variant='p'>USA</Typography>
                        </Box>
                        {/* <UseLoocation/> */}
                     </Box>

                    <Grower/>

                    <Button 
                    variant='outlined' 
                    color='primary' 
                    style={{
                    height: '50px', 
                    width: '100px', 
                    marginTop: '10px' 
                    }}  
                    onClick={skipCapture}>Skip<SkipNextIcon/></Button>
                    
                </Grid>


            </Box>

            <Box className={classes.imgBox}>
                {/* {treeList.slice(0, 1).map( img => { */}
                    {imageData
                    .slice((currentPage - 1) * imgPerPage, currentPage * imgPerPage)
                    .map( img => {
                    return (
                        <img isEqual={props.isEqual} key={img.id} className={classes.imgContainer} src={img.url}/>
                    )
                })}
                   
             </Box>
        </div>
    
    )
}

export default CaptureImage

