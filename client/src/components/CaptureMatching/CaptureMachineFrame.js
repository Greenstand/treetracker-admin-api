import React, {useState, useEffect} from 'react'
import axios from 'axios'

import Captures from './Captures'
import CandidateCapture from './CandidateCapture'
import CurrentCaptureNumber from './CurrentCaptureNumber'
import {catptureImages} from './ImageData.json'
import {trees} from './CaptureData.json';
import CaptureHeader from './CaptureHeader'

import {makeStyles} from '@material-ui/core/styles'
import {Grid, Box} from '@material-ui/core'
import NatureOutlinedIcon from '@material-ui/icons/NatureOutlined';
import {useMediaQuery} from '@material-ui/core';




const useStyle = makeStyles({
    container: {
        background: '#eee',
        width: '100%',
         height: 'auto',
         display: 'flex',
         paddingBottom: '40px',

    },

})



function CaptureMachineFrame() {


    const classes = useStyle()

    const imageListData = trees
    const [imageData, setImageData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [imgPerPage, setImgPerPage] = [1]
    const [imageList, setImageList] = useState(imageListData)

    // To set total pages for pagination
    const [noOfPages, setNoOfPages] = useState(null);

    // To get the total images count for capture header Icon
    const [imgCount, setImgCount] = useState(null)

    // To get total tree count on candidate capture image icon
    const treesCount = imageList.length
    const treeIcon = <NatureOutlinedIcon
                     style={{
                        flex: "1",
                        fontSize: "37px",
                        color: "#666",
                        padding: '5px'}}
                     />


    // Capture Image Pagination function
    const handleChange = (event, value) => {
        setCurrentPage(value);
      };

    // Set API as a variable
    const captureApiFetch = 'https://jsonplaceholder.typicode.com/photos'
    //const captureApiFetch = 'https://dev-k8s.treetracker.org/treetracker/captures'


    //fatching data
    useEffect(() => {
        setLoading(true)
       axios.get(captureApiFetch)
            .then(response => {
                setImageData(response.data)
                setNoOfPages( Math.ceil(response.data.length/ imgPerPage))
                setImgCount(response.data.length)
                setLoading(false)
            })


        }, [])




    // useEffect(async () => {
    //     setLoading(true)
    //     const response = await fetch('https://jsonplaceholder.typicode.com/photos');
    //     const data = await response.json()
    //     console.log(data);

    //    axios.get(captureApiFetch)
    //         .then(response => {
    //             setImageData(data)
    //             setNoOfPages( Math.ceil(data.length/ imgPerPage))
    //             setImgCount(data.length)
    //             setOnSkip(imageData)
    //             setLoading(false)
    //         })

    //     }, [])


    // Same Tree Capture function
    const deleteDataHandler = (id, i) => {
        const newImgData = imageData.splice(id, imageData.length -1 )
        setImageData(newImgData)
        console.log('changed')

    }

    // Skip button
     const handleSkip = ( ) => {
        const skip = currentPage + imgPerPage
        setCurrentPage(skip)
        console.log('hi' + skip)
     }


    // MediaQueries

    const screenMatch = ('(min-width: 786px)');


    return (

        <div className={classes.container}>
            <Grid
            container
            direction="row"

             >

            <Captures
            // treeList={treeList}
            imageData={imageData}
            currentPage={currentPage}
            loading={loading}
            noOfPages={noOfPages}
            handleChange={handleChange}
            captureApiFetch={captureApiFetch}
            imgPerPage={imgPerPage}
            imgCount={imgCount}
            handleSkip={handleSkip}
            />




           <Box style={{width: '50%'}}>
            <Box p={2} style={{width: '220px', margin: '10px 0 0 12px' }}>
            <CurrentCaptureNumber
                text='Candidate Match'
                style={{paddingTop: '10px'}}
                treeIcon={treeIcon}
                treesCount={treesCount}


            />
          </Box>
            <CandidateCapture
            imageList={imageList}
            deleteDataHandler={deleteDataHandler}
            />

          </Box>

       </Grid>
   </div>



    )
}

export default CaptureMachineFrame
