import React from 'react'

import {Button, Typography, Box} from '@material-ui/core'


function Grower() {
    return (
        <div style={{display: 'flex'}}>
               <img src='https://plchldr.co/i/100x100' alt='' style={{borderRadius: '50%'}}/>
            <Box style={{margin: 'auto', paddingLeft: '10px'}}>
               <Typography variant='p' style={{display: 'block'}}>Grower Name</Typography>
               <Typography variant='p'>grower status </Typography>
            </Box>
        </div>
    )
}

export default Grower
