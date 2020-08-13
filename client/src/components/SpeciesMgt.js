import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import {
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  Drawer,
  TablePagination,
  TableSortLabel,
  Typography,
  IconButton,
  Paper,
} from '@material-ui/core'
import Navbar from './Navbar'
import { connect } from 'react-redux'

const styles = (theme) => {
  return {
    root: {},
  }
}

const SpeciesMgt = () => {
  return (
    <Grid container direction="column" style={{ flexWrap: 'nowrap', height: '100%' }}>
      <Grid item>
        <Navbar />
      </Grid>
      <Grid item container style={{ height: '100%', overflow: 'hidden' }}>
        <SpeciesTable />
      </Grid>
    </Grid>
  )
}

const SpeciesTable = (props) => {
  React.useEffect(() => {
    props.speciesDispatch.loadSpeciesList()
    console.log(props.speciesState.speciesList)
  }, [])

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, props.speciesState.speciesList.length - page * rowsPerPage)

  // const loadTrees(payload) {
  //   this.props.getTreesAsync(payload).then(() => {
  //     this.scrollRef.current.scrollTo(0,0)
  //   })
  // }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getSpecies = () => {
    return (rowsPerPage > 0
      ? props.speciesState.speciesList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : props.speciesState.speciesList
    ).map((specie) => (
      <TableRow key={specie.id} role="listitem">
        <TableCell component="th" scope="row">
          {specie.id}
        </TableCell>
        <TableCell component="th" scope="row">
          {specie.name}
        </TableCell>
        <TableCell>{specie.desc}</TableCell>
        <TableCell>
          {/* <IconButton title="edit" onClick={() => handleEdit(user)}>
            <Edit />
          </IconButton> */}
          <IconButton>{/* <Delete /> */}</IconButton>
        </TableCell>
      </TableRow>
    ))
  }

  const tablePagination = () => {
    return (
      <TablePagination
        component="div"
        count={props.speciesState.speciesList.length}
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
        colSpan={3}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    )
  }

  return (
    <div>
      {/* <Grid container direction="row" justify="space-between" alignItems="center">
        <Typography variant="h5">Trees</Typography>
        {tablePagination()}
      </Grid> */}
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Operations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSpecies()}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow> {tablePagination()}</TableRow>{' '}
          </TableFooter>
        </Table>
      </TableContainer>
    </div>
  )
}

export default withStyles(styles)(
  connect(
    //state
    (state) => ({
      speciesState: state.species,
    }),
    //dispatch
    (dispatch) => ({
      speciesDispatch: dispatch.species,
    })
  )(SpeciesTable)
)
