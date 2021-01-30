import React, {useState} from 'react'

import Data from './CaptureData.json'

import {Paper, Typography, Box, Icon} from '@material-ui/core';




const treeList = Data.trees

function CurrentCaptureNumber(props) {


const [treeCount, setTreeCount] = useState(treeList)

    return (
        <div>
            <Paper  elevation={2}>
             
             <Box p={2} style={{display: "flex",  width: "200px"}}>
                <Box>{props.cameraImg}{props.treeIcon}</Box>
                    <Typography 
                        variant="p" 
                        width="65%"
                        style={{fontSize: "14px", padding: '5px'}}
                    >{treeCount.length}
                        <span style={{display: "block"}}>
                            {props.text}
                        </span>
                    </Typography>

            </Box>
        </Paper>
    </div>
    )
}

export default CurrentCaptureNumber
