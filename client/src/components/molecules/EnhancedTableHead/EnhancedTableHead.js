import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import compose from 'recompose/compose'

import Checkbox from '@material-ui/core/Checkbox'
import TableHead from '@material-ui/core/TableHead'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Tooltip from '@material-ui/core/Tooltip'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

const styles = theme => ({
  head: {
    backgroundColor: '#eee',
    position: 'sticky',
    top: theme.spacing.unit * 19,
    boxShadow: '12px 0px 12px -2px rgba(0,0,0,0.2)',
    zIndex: 100
  },
  locationCol: {
    minWidth: '200px'
  }
});

const EnhancedTableHead = (props) => {

  const { order, orderBy, rowCount, classes } = props

  const columnData = [
    { id: 'id', label: 'Id', sortable: true },
    { id: 'timeCreated', label: 'Creation', sortable: true },
    { id: 'timeUpdated', label: 'Updated', sortable: true },
    { id: 'Location', label: 'Location' }
  ]

  const handleSelectAll = () => {
    console.log('handleSelectAll')

  }

  const handleSort = (order, orderBy) => {
    props.sortTrees(order, orderBy)
  }

  const numSelected = props.selected.length

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" className={classes.head}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected === rowCount}
            onChange={handleSelectAll}
          />
        </TableCell>
        {columnData.map(column => {
          if( column.sortable ) {
            return (
              <TableCell
                className={classes.head}
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={250}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={function(e){ handleSort(order, column.id) }}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            )
          } else {
            return (
              <TableCell
                className={classes.head}
                key={column.id}
              >
                {column.label}
              </TableCell>
            )
          }
        })}
      </TableRow>
    </TableHead>
  )
}

const mapState = state => {
  return {
    page: state.trees.page,
    rowsPerPage: state.trees.rowsPerPage,
    selected: state.trees.selected,
    order: state.trees.order,
    orderBy: state.trees.orderBy
  }
}

const mapDispatch = dispatch => {
  return {
    sortTrees: (order, orderBy) => dispatch.trees.sortTrees({order, orderBy})
  }
}


export default compose(
  withStyles(styles, { withTheme: true, name: 'EnhancedTableHead' }),
  connect(mapState, mapDispatch)
)(EnhancedTableHead)
