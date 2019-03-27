import React, { Component } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MUIDataTable from 'mui-datatables';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import dateFormat from 'dateformat';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Drawer from '@material-ui/core/Drawer';

import TreeDetails from '../TreeDetails/TreeDetails';
import EnhancedTableHead from '../../molecules/EnhancedTableHead/EnhancedTableHead';

// change 88 to unit spacing,
const styles = theme => ({
  root: {
    position: 'relative',
    top: '88px',
    paddingLeft: '70px',
    overflowX: 'auto'
  },
  locationCol: {
    width: '270px'
  },
  table: {
    minHeight: '100vh'
  },
  tableBody: {
    minHeight: '100vh'
  },
  pagination: {
    position: 'sticky',
    bottom: '0px',
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.15)'
  }
});

class TreeTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailsPane: false
    };
    this.onChangeRowsPerPage = this.onChangeRowsPerPage.bind(this);
  }

  componentDidMount() {
    const payload = {
      page: this.props.page,
      rowsPerPage: this.props.rowsPerPage,
      order: this.props.order,
      orderBy: this.props.orderBy
    };
    this.props.getTreesAsync(payload);
  }

  handleSelection = e => {};

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    this.setState({ selected: newSelected });
  };

  toggleDrawer = id => {
    console.log(id);
    this.props.getTreeAsync(id);
    const { detailsPane } = this.state;
    this.setState({
      detailsPane: !detailsPane
    });
  };

  onPageChange = (event, page) => {
    this.props.getTreesAsync({
      page: page,
      rowsPerPage: this.props.rowsPerPage
    });
  };

  onChangeRowsPerPage = event => {
    this.props.getTreesAsync({
      page: this.props.page,
      rowsPerPage: event.target.value
    });
  };

  isSelected = id => this.props.selected.indexOf(id) !== -1;

  render() {
    const {
      numSelected,
      classes,
      rowsPerPage,
      selected,
      order,
      orderBy,
      treesArray,
      getLocationName,
      treeCount,
      byId,
      tree
    } = this.props;
    const columnData = [
      { name: 'id', label: 'Id', options: { sortable: true } },
      { name: 'timeCreated', label: 'Creation', options: { sortable: true } },
      { name: 'timeUpdated', label: 'Updated', options: { sortable: true } },
      {
        label: 'Location',
        options: {
          sortable: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return <span>botched rendering func</span>;
          }
        }
      },
      {
        label: 'Mark Inactive',
        options: {
          sortable: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return <Delete />;
          }
        }
      }
    ];
    const options = {
      filterType: 'dropdown',
      onRowClick: (_, rowMeta) => {
        const id = treesArray[rowMeta.dataIndex].id;
        this.toggleDrawer(id);
      }
      /*serverSide: true,
      onTableChange: (action, tableState) => {
        const payload = {
          page: this.props.page,
          rowsPerPage: this.props.rowsPerPage,
          order: this.props.order,
          orderBy: this.props.orderBy
        };
        this.props.getTreesAsync(payload);
      }*/
    };
    return (
      <React.Fragment>
        <MUIDataTable
          title={'Trees'}
          data={this.props.treesArray}
          columns={columnData}
          options={options}
        />
        <Drawer
          anchor="right"
          open={this.state.detailsPane}
          onClose={event => this.toggleDrawer(event, undefined)}
        >
          <TreeDetails tree={tree} />
        </Drawer>
      </React.Fragment>
    );
  }
}

const mapState = state => {
  const keys = Object.keys(state.trees.data);
  return {
    treesArray: keys.map(id => ({
      ...state.trees.data[id]
    })),
    page: state.trees.page,
    rowsPerPage: state.trees.rowsPerPage,
    selected: state.trees.selected,
    order: state.trees.order,
    orderBy: state.trees.orderBy,
    numSelected: state.trees.selected.length,
    byId: state.trees.byId,
    isOpen: state.trees.displayDrawer.isOpen,
    tree: state.trees.tree
  };
};

const mapDispatch = dispatch => ({
  getTreesAsync: ({ page, rowsPerPage, order, orderBy }) =>
    dispatch.trees.getTreesAsync({
      page: page,
      rowsPerPage: rowsPerPage,
      order: order,
      orderBy: orderBy
    }),
  getLocationName: (id, lat, lon) =>
    dispatch.trees.getLocationName({ id: id, latitude: lat, longitude: lon }),
  getTreeAsync: id => dispatch.trees.getTreeAsync(id)
});

export default compose(
  withStyles(styles, { withTheme: true, name: 'TreeTable' }),
  connect(
    mapState,
    mapDispatch
  )
)(TreeTable);
