import React, {useState, useEffect} from 'react'


import { Paper, Typography, Box, Button, Grid, Backdrop} from '@material-ui/core';
import PhotoCameraOutlinedIcon from '@material-ui/icons/PhotoCameraOutlined';
import Pagination from './Pagination'

import FilterListIcon from '@material-ui/icons/FilterList';
import { makeStyles } from '@material-ui/core/styles';

import {trees} from './CaptureData.json'
import CurrentCaptureNumber from './CurrentCaptureNumber';
import CaptureImage from './CaptureImage'


const useStyles = makeStyles({
    containerBox: {
        margin: '10px',
        padding: '10px',


    },

    headerBox: {
        display: 'flex',
        flexDirection: 'spaceBetween'

    }
})

function Captures(props) {

    const treeList = props.treeList

    const {
        imageData, 
        loading, 
        currentPage,
        noOfPages,
        handleChange,
        captureApiFetch,
        imgPerPage,
        skipCapture
    } = props;

     const iconImgLogo = <PhotoCameraOutlinedIcon style={{
                            flex: "1", 
                            fontSize: "37px", 
                            color: "#666", 
                            padding: '5px'
                        }} 
                        />


    return (
        <div style={{width: '50%'}}>

            <Box>

        <Grid  
            container direction="row" 
            justify="space-around" 
            alignItems="baseline"
            >

            <Box style={{
                paddingTop: '15px', 
                marginLeft: '-22px'
             }}
            >
                <CurrentCaptureNumber 
                text='Unmatched Captures' 
                style={{paddingTop: '10px'}} 
                cameraImg={iconImgLogo} 
                />
            </Box>

            <Box style={{display: 'flex', flexDirection: 'wrap'}}>
                <Button variant="contained" style={{
                    height: "30px", 
                    margin: "0 20px 0 20px", 
                    textTransform: 'capitalize', 
                    borderRadius: "15px"
                    }}>My Organizations
                </Button>

                <FilterListIcon style={{
                    color: "#666", 
                    fontSize: "40",  
                    margin: "0 20px 0 20px;"
                    }}
                />
            
                <Pagination 
                    currentPage={currentPage}
                    noOfPages={noOfPages}
                    handleChange={handleChange}
                />
            </Box>
        </Grid>

            </Box>

    <CaptureImage 
        treeList={treeList} 
        imageData={imageData}
        currentPage={currentPage}
        loading={loading}
        noOfPages={noOfPages}
        // handleChange={handleChange}
        captureApiFetch={captureApiFetch}
        imgPerPage={imgPerPage}
    />
       
 </div>
 
    )
}

export default Captures;
