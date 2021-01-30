import React, {useState, useEffect} from 'react'
import axios from 'axios'
import Captures from './Captures'
import CandidateCapture from './CandidateCapture'
import CurrentCaptureNumber from './CurrentCaptureNumber'
import {catptureImages} from './ImageData.json'
import {trees} from './CaptureData.json';


import {makeStyles} from '@material-ui/core/styles'
import {Grid, Box} from '@material-ui/core'
import NatureOutlinedIcon from '@material-ui/icons/NatureOutlined';





const useStyle = makeStyles({
    container: {
        background: '#eee',
        width: '100%',
         display: 'flex',
         paddingBottom: '40px',

    }
})



function CaptureMachineFrame() {

    const treeList = catptureImages
    const imageList = trees
    const treeIcon = <NatureOutlinedIcon style={{flex: "1", fontSize: "37px", color: "#666", padding: '5px'}}/>
    const classes = useStyle()



    const [imageData, setImageData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [imgPerPage, setImgPerPage] = [1]
    const [noOfPages, setNoOfPages] = useState(null);

    const handleChange = (event, value) => {
        setCurrentPage(value);
      };
    
    // Setting API as a variable
    const captureApiFetch = 'https://jsonplaceholder.typicode.com/photos'

    // fatchData from api Variable
    useEffect(() => {
        setLoading(true)
       axios.get(captureApiFetch)
            .then(response => {
                setImageData(response.data)
                setNoOfPages( Math.ceil(response.data.length/ imgPerPage))
                setLoading(false)
            })
            
        }, [])


// Skip button  function

    const skipCapture = () => {
        // setImgPerPage(imgPerPage);

    }


    return (

        <div className={classes.container}>
            <Grid
            container
            direction="row"
           
             >
            <Captures 
            treeList={treeList} 
            imageData={imageData}
            currentPage={currentPage}
            loading={loading}
            noOfPages={noOfPages}
            handleChange={handleChange}
            captureApiFetch={captureApiFetch}
            imgPerPage={imgPerPage}
            skipCapture={skipCapture}
            />


           <Box style={{width: '50%'}}>
            <Box p={2} style={{width: '220px', margin: '10px 0 0 12px' }}>
            <CurrentCaptureNumber 
                text='Candidate Match' 
                style={{paddingTop: '10px'}} 
                treeIcon={treeIcon}
            />
            </Box>
            <CandidateCapture imageList={imageList}/>

            </Box>

            </Grid>
        </div>



    )
}

export default CaptureMachineFrame
