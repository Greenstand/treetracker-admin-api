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
import CandidateImages from './CandidateImages'


const useStyles = makeStyles({
    containerBox: {
        margin: '10px',
        padding: '10px',


    },

    // headerBox: {
    //     display: 'flex',
    //     flexDirection: 'spaceBetween',

    // }
})

function CandidateCapture(props) {

    const [startNum, setStartNum] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentpage] = useState(1)
    const [imgPerPage] = useState(1)

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
        <div >

           <CandidateImages imageList={props.imageList}/>


        </div>
    )
}

export default CandidateCapture;
