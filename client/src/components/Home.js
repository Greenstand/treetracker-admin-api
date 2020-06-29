import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import Menu from './common/Menu'
import * as d3 from 'd3'
import log from 'loglevel'
import { ReactComponent as Logo } from './images/logo.svg'
import assert from 'assert'

const logo = (
  <svg
    className="logo"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="36px"
    height="45px"
    viewBox="0 0 36 45"
    version="1.1"
  >
    {/*<!-- Generator: Sketch 53 (72520) - https://sketchapp.com -->*/}
    <title>logo</title>
    <desc>Created with Sketch.</desc>
    <defs>
      <path
        d="M22.2771346,14.2588603 C19.7881098,14.2588603 17.7705795,12.2557373 17.7705795,9.78489306 C17.7705795,7.31387731 19.7881098,5.31075432 22.2771346,5.31075432 C24.7661594,5.31075432 26.7836897,7.31387731 26.7836897,9.78489306 C26.7836897,12.2557373 24.7661594,14.2588603 22.2771346,14.2588603 Z M32.7638325,12.174302 C35.0147946,19.3738131 34.738484,27.3869912 31.3960008,34.801239 C30.0247389,37.843571 28.2306926,40.5596816 26.1222594,42.9252157 L19.9297125,42.9252157 C22.3158284,37.2659087 23.3797355,30.9545019 22.7535345,24.4108639 C22.6092904,22.9042767 22.3700271,21.4307918 22.0606141,19.9861215 C25.0773904,16.622199 28.7366617,13.9789822 32.7638325,12.174302 Z M7.37836922,-2.4158453e-13 C14.0069071,6.16767727 18.4909937,14.688368 19.4212908,24.4108639 C20.0474918,30.9545019 18.9835846,37.2659087 16.5974688,42.9252157 L5.82976082,42.9252157 C2.76719004,38.0375544 0.763724022,32.3849365 0.17697141,26.2524198 C-0.753325628,16.5299239 2.03327761,7.31356858 7.37836922,-2.4158453e-13 Z"
        id="path-1"
      />
      <filter
        x="-4.4%"
        y="-3.5%"
        width="108.8%"
        height="107.0%"
        filterUnits="objectBoundingBox"
        id="filter-2"
      >
        <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0"
          type="matrix"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Desktop-HD-Copy-5" transform="translate(-39.000000, -50.000000)">
        <g id="logo" transform="translate(40.000000, 51.000000)">
          <g>
            <use fill="black" fillOpacity="1" filter="url(#filter-2)" xlinkHref="#path-1" />
            <use fill="#86C232" fillRule="evenodd" xlinkHref="#path-1" />
          </g>
        </g>
      </g>
    </g>
  </svg>
)

const style = (theme) => ({
  box: {
    height: '100%',
  },
  menu: {
    height: '100%',
  },
  rightBox: {},
  welcomeBox: {
    height: '100%',
    padding: theme.spacing(4),
    //paddingTop: '25%', //theme.spacing(50),
  },
})

function Home(props) {
  const { classes } = props

  async function load() {
    const logoElement = d3.select('.logo')
    assert(logoElement)
    assert(logoElement.node())
    const g = d3.select('#trees')
    log.info('g:', g)
    //    g.data([
    //      {
    //        x: 100,
    //        y: 100,
    //      },
    //    ])
    //      .enter()
    //    g.append('cricle').attr('cx', 20).attr('cy', 20).style('fill', 'purple')
    //    g.insert(logoElement.node().cloneNode(true))
    const htmlCode = d3.select('#logoDiv').node().innerHTML
    assert(htmlCode.match(/<svg.*/))
    g.append('g')
      .attr('transform', 'translate(200 200)')
      .append('g')
      .html(htmlCode)
      //original size: 58, 73
      .attr('transform', `translate(${-58/2} ${-73/2}), scale(0)`)
      .attr('transform-origin', `${58/2} ${73/2} `)
      .transition()
      .duration(1000)
      .ease(d3.easeElasticOut.amplitude(.6).period(0.3))
      .attr('transform', `translate(${-58/2} ${-73/2}), scale(.5)`)

  }

  React.useEffect(() => {
    load()
  }, [])

  return (
    <Grid container className={classes.box}>
      <Grid item xs={3}>
        <Paper elevation={3} className={classes.menu}>
          <Menu variant="plain" />
        </Paper>
      </Grid>
      <Grid item xs={9}>
        <Grid container className={classes.welcomeBox} justify="center">
          {/*
          <Typography variant="h4" color="primary">
            Welcome to Greenstand Admin Panel
          </Typography>
          */}
          <div id="logoDiv">{logo}</div>
          <svg viewBox="0 0 500 500" width="100%" height="100%">
            <g id="trees" />
            <circle cx="50" cy="50" r="4" />
          </svg>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withStyles(style)(Home)
