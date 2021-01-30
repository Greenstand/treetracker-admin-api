import React, {useState, useEffect} from 'react'


import { Paper, Typography, Box, Button, Grid, Backdrop} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import {trees} from './CaptureData.json'
import CandidateImages from './CandidateImages'


const useStyles = makeStyles({
    containerBox: {
        margin: '10px',
        padding: '10px',


    },

})

function CandidateCapture(props) {


    return (
        <div >

           <CandidateImages imageList={props.imageList}/>


        </div>
    )
}

export default CandidateCapture;
