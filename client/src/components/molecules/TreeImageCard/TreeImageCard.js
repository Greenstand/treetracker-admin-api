import React, { Component } from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  img: {
    width: '100%',
    height: 'auto'
  },
  title: {
    color: '#f00'
  },
  card: {
    margin: '0.5rem',
    border: '1px #dedede solid'
  },
  media: {
    height: '12rem'
  },
  wrapper: {
    width: '33.33%',
  }
})


class TreeImageCard extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const tree  = this.props.tree
    const classes = this.props.classes
    return (
      <div className={classes.wrapper}>
        <Card className={classes.card}>
          <CardContent>
            <CardMedia
              className={classes.media}
              image={tree.imageUrl}
            />
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              Tree # {tree.id}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Delete</Button>
            <Button size="small">Open Tree in Trees View</Button>
          </CardActions>
        </Card>
      </div>
    )
  }
}



const mapDispatch = (dispatch) => ({
  getLocationName: (id, lat, lon) => dispatch.trees.getLocationName({ id: id, latitude: lat, longitude: lon }),
  // `Mark Inactive` (Deactivate tree will likely be mapped here look at models/trees.js ...)
})

export default compose(
  withStyles(styles, { withTheme: true, name: 'TreeImageCard' }),
  connect(mapDispatch)
)(TreeImageCard)
