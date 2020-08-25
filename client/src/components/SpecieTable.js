import React from 'react'
import { connect } from 'react-redux'
import {
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  Button,
  TablePagination,
  Typography,
  IconButton,
  Paper,
} from '@material-ui/core'

import Menu from './common/Menu'
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
  box: {
    height: '100%',
  },
  menu: {
    height: '100%',
  },
  rightBox: {
    height: '100%',
    padding: theme.spacing(8),
  },
  titleBox: {
    marginBottom: theme.spacing(4),
  },
  accountIcon: {
    fontSize: 67,
    marginRight: 11,
  },
  addUserBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUser: {
    color: 'white',
  },
  input: {
    margin: theme.spacing(0, 1, 4, 1),
  },
  firstName: {
    marginRight: theme.spacing(1),
  },
  lastName: {
    marginRight: theme.spacing(1),
  },
  paper: {
    width: 200,
    height: 230,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
  noteBox: {
    backgroundColor: 'lightgray',
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
  },
  copyIcon: {
    position: 'relative',
    bottom: 20,
  },
  copyMsg: {
    color: theme.palette.primary.main,
    position: 'relative',
    bottom: 5,
  },
  radioButton: {
    '&$radioChecked': { color: theme.palette.primary.main },
  },
  radioChecked: {},
  radioGroup: {
    position: 'relative',
    bottom: 12,
    left: 10,
  },
})

const SpecieTable = (props) => {
  React.useEffect(() => {
    props.speciesDispatch.loadSpeciesList()
    console.log(props.speciesState.speciesList)
  }, [])
  const { classes } = props

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, props.speciesState.speciesList.length - page * rowsPerPage)

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
    <>
      <Grid container className={classes.box}>
        <Grid item xs={3}>
          <Paper elevation={3} className={classes.menu}>
            <Menu variant="plain" />
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Grid container className={classes.rightBox}>
            <Grid item xs="12">
              <Grid container justify="space-between" className={classes.titleBox}>
                <Grid item>
                  <Grid container>
                    <Grid item>
                      <Typography variant="h2">Species</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item className={classes.addUserBox}>
                  <Button
                    // onClick={handleAddUser}
                    variant="contained"
                    className={classes.addUser}
                    color="primary"
                  >
                    ADD NEW SPECIES
                  </Button>
                </Grid>
              </Grid>
              <Grid container direction="column" className={classes.bodyBox}>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
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
                      <TableRow> {tablePagination()}</TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
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
  )(SpecieTable)
)
