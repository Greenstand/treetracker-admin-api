import React, {useState, useEffect} from 'react'


import { Paper, Typography, Box, Button, Grid, Backdrop} from '@material-ui/core';
import PhotoCameraOutlinedIcon from '@material-ui/icons/PhotoCameraOutlined';


import FilterListIcon from '@material-ui/icons/FilterList';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import orange from '@material-ui/core/colors/orange'
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

    const [startNum, setStartNum] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentpage] = useState(1)
    const [imgPerPage] = useState(1)
    const iconImgLogo = <PhotoCameraOutlinedIcon style={{flex: "1", fontSize: "37px", color: "#666", padding: '5px'}} />

    // useEffect(() => {
    //     const fetchImages = async () => {
    //         setLoading(true);
    //         const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    //         setStartNum(res.data);
    //         setLoading(false);
    //     }

    //     fetchImages();
    // }, [])



    // Get current Img

    const indexOfLastImg = currentPage * imgPerPage;
    const IndexOfFirstImg = indexOfLastImg - imgPerPage;
    const currentImage = startNum.slice(IndexOfFirstImg, indexOfLastImg)

    // change page

    const handlePagePeginateNext = (num) => {

        setCurrentpage(num)

    }


    return (
        <div style={{width: '50%'}}>

            <Box>

            <Grid  container direction="row" justify="space-around" alignItems="baseline">
            <Box style={{paddingTop: '15px', marginLeft: '-22px'}}>
            <CurrentCaptureNumber text='Unmatched Captures' style={{paddingTop: '10px'}} cameraImg={iconImgLogo}/>
            </Box>
            <Box>
            <Button variant="contained"
            style={{height: "30px", margin: "0 20px 0 20px", textTransform: 'capitalize', borderRadius: "15px"}}>My Organizations
            </Button>
            {/* <Filter count={}/> */}
            <FilterListIcon style={{color: "#666", fontSize: "40",  margin: "0 20px 0 20px;"}}/>
            <ChevronLeftIcon style={{ margin: "0 10px 0 20px"}}/>
            <Typography
            style={{color: orange, display: "inline-block",  margin: "0 20px 0 10px"}}>1 of 20
             </Typography>
             <ChevronRightIcon/>
            </Box>

            </Grid>


            </Box>

           <CaptureImage treeList={props.treeList}/>
        </div>
    )
}

export default Captures;
