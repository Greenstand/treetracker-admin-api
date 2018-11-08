/*
PictureScrubber

A handy tool for quickly flagging bad images

*/
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const ImageScrubber = (props) => ({

  render() {
    return (
      <div className={'imageScrubber'}>
        <h1>Image Scrubber Will Live Here!!</h1>
      </div>
    )
  }
})

const mapState = (state) => {
  return { state: state }
}

const mapDispatch = (dispatch) => {
  return {}
}

ImageScrubber.propTypes = {
}

export default connect(mapState, mapDispatch)(ImageScrubber)
