import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MUIDataTable from 'mui-datatables';
import dateformat		from 'dateformat';
import Filter, {FILTER_WIDTH}		from './Filter';
import FilterModel		from '../models/Filter';
import {MENU_WIDTH}		from './common/Menu';

import Drawer from '@material-ui/core/Drawer';

import TreeDetails from './TreeDetails.js';

// change 88 to unit spacing,
const styles = () => ({
  root: {
    position: 'relative',
    top: '88px',
    paddingLeft: '70px',
    overflowX: 'auto',
  },
	myTable		: {
		width		: `calc(100vw - ${FILTER_WIDTH}px)`,
	},
  locationCol: {
    width: '270px'
  },
  table: {
    minHeight: '100vh',
		'&:nth-child(2)': {
			width: 20,
		}
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
      detailsPane: false,
      page: 0,
			filter		: new FilterModel(),
    };
  }

  componentDidMount() {
    const payload = {
      page: this.state.page,
      rowsPerPage: this.props.rowsPerPage,
      order: this.props.order,
      orderBy: this.props.orderBy
    };
    this.props.getTreesAsync(payload);
  }

  toggleDrawer = id => {
    this.props.getTreeAsync(id);
    const { detailsPane } = this.state;
    this.setState({
      detailsPane: !detailsPane
    });
  };

	handleFilterSubmit = filter => {
		this.setState({
			//reset
			page		: 0,
			filter,
		},() => {
			this.props.getTreesAsync({
				page		: 0,
				rowsPerPage		: this.props.rowsPerPage,
				filter,
			});
		})
	}

  onPageChange = (page, rowsPerPage) => {
    this.props.getTreesAsync({
      page,
      rowsPerPage
    });
    this.setState({
      page
    });
  };

  onChangeRowsPerPage = rowsPerPage => {
    this.props.getTreesAsync({
      page: this.state.page,
      rowsPerPage
    });
  };

  onSort = (order, orderBy) => {
    this.props.sortTrees(order, orderBy);
  };

  render() {
    const { treesArray, tree , classes} = this.props;
    const columnData = [
      { name: 'id', label: 'Tree' },
			{
				name		: '',
				label		: 'Planter',
				options		: {
					customBodyRender		: () => 'pending',
				}
			},
			{
				name		: '',
				label		: 'Payment',
				options		: {
					customBodyRender		: () => 'pending',
				},
			},
			{
				name		: '',
				label		: 'Country',
				options		: {
					customBodyRender		: () => 'pending',
				},
			},
			{
				name		: '',
				label		: 'Specie',
				options		: {
					customBodyRender		: () => 'pending',
				},
			},
			{
				name		: 'status',
				label		: 'Status',
			},
      {
				name: 'timeCreated',
				label: 'Created',
				options		: {
					customBodyRender		: v => `${dateformat(v, 'm/d/yyyy h:Mtt')}`,
				},
			},
    ];
    const options = {
      filterType: 'dropdown',
      onRowClick: (_, rowMeta) => {
        const id = treesArray[rowMeta.dataIndex].id;
        this.toggleDrawer(id);
      },
      serverSide: true,
      count: this.props.treeCount,
      page: this.state.page,
      rowsPerPage: this.props.rowsPerPage,
      rowsPerPageOptions: [25, 50, 75, 100, 250, 500],
      onTableChange: (action, tableState) => {
        console.log(tableState);
        switch (action) {
          case 'changePage':
            this.onPageChange(tableState.page, tableState.rowsPerPage);
            break;
          case 'changeRowsPerPage':
            this.onChangeRowsPerPage(tableState.rowsPerPage);
            break;
          case 'sort':
            const col = tableState.columns[tableState.activeColumn];
            this.onSort(col.sortDirection === 'asc' ? 'desc' : 'asc', col.name);
            break;
        }
      }
    };
    return (
      <React.Fragment>
        <MUIDataTable
          title={'Trees'}
          data={this.props.treesArray}
          columns={columnData}
          options={options}
					className={classes.myTable}
        />
        <Drawer
          anchor="right"
          open={this.state.detailsPane}
          onClose={event => this.toggleDrawer(event, undefined)}
        >
          <TreeDetails tree={tree} />
        </Drawer>
				<Filter
					isOpen={true}
					onSubmit={this.handleFilterSubmit}
					filter={this.state.filter}
				/>
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
    tree: state.trees.tree,
    treeCount: state.trees.treeCount
  };
};

const mapDispatch = dispatch => ({
  getTreesAsync: ({ page, rowsPerPage, order, orderBy , filter}) =>
    dispatch.trees.getTreesAsync({
      page: page,
      rowsPerPage: rowsPerPage,
      order: order,
      orderBy: orderBy,
      filter: filter,
    }),
  getLocationName: (id, lat, lon) =>
    dispatch.trees.getLocationName({ id: id, latitude: lat, longitude: lon }),
  getTreeAsync: id => dispatch.trees.getTreeAsync(id),
  sortTrees: (order, orderBy) =>
    dispatch.trees.sortTrees({ order: order, orderBy: orderBy })
});

export default compose(
  withStyles(styles, { withTheme: true, name: 'TreeTable' }),
  connect(
    mapState,
    mapDispatch
  )
)(TreeTable);
