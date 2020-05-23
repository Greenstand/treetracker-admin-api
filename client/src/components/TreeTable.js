import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { Table, TableHead, TableBody, TableRow, TableCell, Drawer, TablePagination } from '@material-ui/core'
import dateformat from 'dateformat'

import Filter, { FILTER_WIDTH } from './Filter'
import FilterModel from '../models/Filter'
import TreeDetails from './TreeDetails.js'

// change 88 to unit spacing,
const styles = () => ({
  root: {
    position: 'relative',
    top: '88px',
    paddingLeft: '70px',
    overflowX: 'auto',
  },
  myTable: {
    width: `calc(100vw  - ${FILTER_WIDTH}px)`,
  },
  tableRow: {
    cursor: 'pointer'
  },
  locationCol: {
    width: '270px',
  },
  table: {
    minHeight: '100vh',
    '&:nth-child(2)': {
      width: 20,
    },
  },
  tableBody: {
    minHeight: '100vh',
  },
  pagination: {
    position: 'sticky',
    bottom: '0px',
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.15)',
  },
})

class TreeTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isDetailsPaneOpen: false,
      page: 0,
      filter: new FilterModel(),
    }
    this.closeDrawer = this.closeDrawer.bind(this)
    this.handleFilterSubmit = this.handleFilterSubmit.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
  }

  componentDidMount() {
    const payload = {
      rowsPerPage: this.props.rowsPerPage,
      order: this.props.order,
      orderBy: this.props.orderBy,
      page: this.state.page
    }
    this.props.getTreesAsync(payload)
  }

  toggleDrawer(id) {
    this.props.getTreeAsync(id)
    const { isDetailsPaneOpen } = this.state
    this.setState({
      isDetailsPaneOpen: !isDetailsPaneOpen,
    })
  }

  getToggleDrawerHandler(id) {
    return () => {
      this.toggleDrawer(id)
    }
  }
  closeDrawer() {
    this.setState({
      isDetailsPaneOpen: false
    })
  }

  handleFilterSubmit(filter) {
    this.setState(
      {
        //reset
        page: 0,
        filter,
      },
      () => {
        this.props.getTreesAsync({
          page: 0,
          rowsPerPage: this.props.rowsPerPage,
          filter,
        })
      }
    )
  }

  handlePageChange(_event, page) {
    this.setState({ page })
    this.props.getTreesAsync({
      page,
      rowsPerPage: this.props.rowsPerPage,
    })
  }

  onSort = (order, orderBy) => {
    this.props.sortTrees(order, orderBy)
  }

  render() {
    const { treesArray, tree, classes } = this.props
    const options = {
      // onTableChange: (action, tableState) => {
      //   switch (action) {
      //     case 'sort':
      //       const col = tableState.columns[tableState.activeColumn]
      //       this.onSort(col.sortDirection === 'asc' ? 'desc' : 'asc', col.name)
      //       break
      //   }
      // },
    }
    return (
      <React.Fragment>
        <Table className={classes.myTable}>
          <TableHead>
            <TableRow>
              <TableCell>Tree</TableCell>
              <TableCell>Planter</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Specie</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {treesArray.map(tree => (
              <TableRow key={tree.id} onClick={this.getToggleDrawerHandler(tree.id)} className={classes.tableRow}>
                <TableCell>{tree.id}</TableCell>
                <TableCell>pending</TableCell>
                <TableCell>pending</TableCell>
                <TableCell>pending</TableCell>
                <TableCell>pending</TableCell>
                <TableCell>{tree.status}</TableCell>
                <TableCell>{dateformat(tree.timeCreated, 'm/d/yyyy h:Mtt')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100, 250, 500]}
          component="div"
          count={this.props.treeCount}
          page={this.state.page}
          rowsPerPage={this.props.rowsPerPage}
          onChangePage={this.handlePageChange}
          onChangeRowsPerPage={(event) => {
            this.props.getTreesAsync({
              page: 0,
              rowsPerPage: parseInt(event.target.value)
            })
          }}
        />
        <Drawer
          anchor="right"
          open={this.state.isDetailsPaneOpen}
          onClose={this.closeDrawer}
        >
          <TreeDetails tree={tree} />
        </Drawer>
        <Filter isOpen={true} onSubmit={this.handleFilterSubmit} filter={this.state.filter} />
      </React.Fragment>
    )
  }
}

const mapState = (state) => {
  const keys = Object.keys(state.trees.data)
  return {
    treesArray: keys.map((id) => ({
      ...state.trees.data[id],
    })),
    rowsPerPage: state.trees.rowsPerPage,
    selected: state.trees.selected,
    order: state.trees.order,
    orderBy: state.trees.orderBy,
    numSelected: state.trees.selected.length,
    byId: state.trees.byId,
    isOpen: state.trees.displayDrawer.isOpen,
    tree: state.trees.tree,
    treeCount: state.trees.treeCount,
  }
}

const mapDispatch = (dispatch) => ({
  getTreesAsync: ({ page, rowsPerPage, order, orderBy, filter }) =>
    dispatch.trees.getTreesAsync({
      page,
      rowsPerPage,
      order,
      orderBy,
      filter,
    }),
  getLocationName: (id, lat, lon) =>
    dispatch.trees.getLocationName({ id: id, latitude: lat, longitude: lon }),
  getTreeAsync: (id) => dispatch.trees.getTreeAsync(id),
  sortTrees: (order, orderBy) => dispatch.trees.sortTrees({ order, orderBy }),
})

export default compose(
  withStyles(styles, { withTheme: true, name: 'TreeTable' }),
  connect(mapState, mapDispatch)
)(TreeTable)
