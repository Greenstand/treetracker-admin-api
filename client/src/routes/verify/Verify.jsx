import React from 'react'
import Grid from '@material-ui/core/Grid'
import TreeImageScrubber from './TreeImageScrubber'

const Verify = () => {
  return (
    <Grid container wrap="nowrap">
      <Grid
        item
        style={{
          width: '100%',
        }}
      >
        <Grid
          container
          style={{
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <TreeImageScrubber />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Verify
