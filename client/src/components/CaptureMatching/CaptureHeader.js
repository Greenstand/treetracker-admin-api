import React, {useState, useEffect} from 'react'

import CurrentCaptureNumber from './CurrentCaptureNumber';
import Pagination from './Pagination'

import { Paper, Typography, Box, Button, Grid, Backdrop} from '@material-ui/core';
import PhotoCameraOutlinedIcon from '@material-ui/icons/PhotoCameraOutlined';
import FilterListIcon from '@material-ui/icons/FilterList';
import { makeStyles } from '@material-ui/core/styles';




const useStyles = makeStyles({
    containerBox: {
        margin: '10px',
        padding: '10px',


    },

})

function CaptureHeader(props) {

    const {
        currentPage,
        handleChange,
        imgCount,
        imageData,
        handleSkip,
        noOfPages
    } = props;

    const iconImgLogo = <PhotoCameraOutlinedIcon style={{
        flex: "1",
        fontSize: "37px",
        color: "#666",
        padding: '5px'
    }}
    />
    const classes = useStyles();


    return (
        <div>
            <Box className={classes.headerIconBox}>

        <Grid
            container direction="row"
            // justify="space-around"
            justify="space-evenly"
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
                imgCount={imgCount}
                // className={classes.headerIconBox}
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
        </div>
    )
}

export default CaptureHeader
