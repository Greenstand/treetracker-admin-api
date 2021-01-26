import React from 'react'
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



    // Matching tree images function

    const isEqual = (treeList, imageList) => {
               const treeListKeys = Object.keys(treeList);
               const imageListKeys = Object.keys(imageList);

               if(treeListKeys.length !== imageListKeys.length) {
                   return false;
               }

               for (let key of treeListKeys) {
                   if (treeListKeys[key] === imageListKeys[key]) {
                       if(typeof treeListKeys[key] == "object" && typeof imageListKeys[key] == "object") {
                           if(isEqual(treeListKeys[key], imageListKeys[key])) {
                               console.log( "same data " );
                               return true;

                           }
                    }
                       else {
                           return false;
                       }
                   }
               }


               return true;

           };

           console.log(isEqual(treeList, imageList))



    return (



        <div className={classes.container}>
            <Grid
            container
            direction="row"
            // justify="left"
            // alignItems="left"
             >
            <Captures treeList={treeList}/>

{/*
            <CurrentCaptureNumber style={{paddingTop: '10px'}}/> */}

           <Box style={{width: '50%'}}>
            <Box p={2} style={{width: '220px', margin: '10px 0 0 12px' }}>
            <CurrentCaptureNumber text='Candidate Match' style={{paddingTop: '10px'}} treeIcon={treeIcon}/>
            </Box>
           {/* <CurrentCaptureNumber style={{paddingTop: '10px', width: '200px'}}/> */}
            <CandidateCapture imageList={imageList}/>

            </Box>

            </Grid>
        </div>



    )
}

export default CaptureMachineFrame
