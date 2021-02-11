import React, {useState, useEffect} from 'react'

import CaptureImage from './CaptureImage'

import { makeStyles } from '@material-ui/core/styles';




const useStyles = makeStyles({
    containerBox: {
        margin: '10px',
        padding: '10px',
    },

    headerIconBox: {
        marginLeft: '33px',
        marginTop: '20px'

    }
})

function Captures(props) {

    const classes = useStyles()
    const treeList = props.treeList

    const {
        imageData,
        loading,
        currentPage,
        noOfPages,
        handleChange,
        captureApiFetch,
        imgPerPage,
        skipCapture,
        imgCount,
        handleSkip
    } = props;


    return (


        <div style={{width: '50%'}}>


    <CaptureImage
        treeList={treeList}
        imageData={imageData}
        currentPage={currentPage}
        loading={loading}
        noOfPages={noOfPages}
        handleChange={handleChange}
        captureApiFetch={captureApiFetch}
        imgPerPage={imgPerPage}
        handleSkip={handleSkip}
        imgCount= {imgCount}
    />

 </div>

    )
}

export default Captures;
