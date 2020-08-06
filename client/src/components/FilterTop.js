import React, { useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import IconClose from '@material-ui/icons/CloseRounded';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FilterModel from '../models/Filter';
import GSInputLabel from './common/InputLabel';
import classNames from 'classnames';
import DateFnsUtils from '@date-io/date-fns';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import {connect} from 'react-redux';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import { getDatePickerLocale, getDateFormatLocale, convertDateToDefaultSqlDate } from '../common/locale'

export const FILTER_WIDTH = 330;

const styles = theme => {
  return {
    root: {},
    drawer: {
      flexShrink: 0
    },
    drawerPaper: {
      width: FILTER_WIDTH,
      padding: theme.spacing(3, 2, 2, 2)
      /*
       * boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
       * */
    },
    close: {
      color: theme.palette.grey[500]
    },
    dateInput: {
      width: 158,
      fontSize: 14
    },
    button: {
      marginTop: 5
    },
    inputContaner: {
      padding: 5,
    },
    input: {
      margin: theme.spacing(2),
    },
    filterElement: {
      marginLeft: 4,
    },
    textField: {
      marginTop: 15,
      width: 142,
    },
    textFieldSelect: {
      marginTop: 17,
      width: 142,
    },
    apply: {
      marginTop: 15,
      marginLeft: 4,
    },
  };
};

function Filter(props) {
  const { classes, filter } = props;
  const dateStartDefault = null;
  const dateEndDefault = null;
  const [treeId, setTreeId] = useState(filter.treeId);
  const [planterId, setPlanterId] = useState(filter.planterId);
  const [deviceId, setDeviceId] = useState(filter.deviceId);
  const [planterIdentifier, setPlanterIdentifier] = useState(
    filter.planterIdentifier
  );
  const [status, setStatus] = useState(filter.status);
  const [approved, setApproved] = useState(filter.approved);
  const [active, setActive] = useState(filter.active);
  const [dateStart, setDateStart] = useState(
    filter.dateStart || dateStartDefault
  );
  const [dateEnd, setDateEnd] = useState(filter.dateEnd || dateEndDefault);
  const [speciesId, setSpeciesId] = useState(0);

  const handleDateStartChange = date => {
    setDateStart(date);
  };

  const handleDateEndChange = date => {
    setDateEnd(date);
  };

  const formatDate = date => {
    return convertDateToDefaultSqlDate(date);
  };

  function handleClear() {
    const filter = new FilterModel();
    setTreeId('');
    setPlanterId('');
    setDeviceId('');
    setPlanterIdentifier('');
    setStatus('All');
    setDateStart(dateStartDefault);
    setDateEnd(dateEndDefault);
    setApproved();
    setActive();
    props.onSubmit && props.onSubmit(filter);
  }

  function handleSubmit() {
    const filter = new FilterModel();
    filter.treeId = treeId;
    filter.planterId = planterId;
    filter.deviceId = deviceId;
    filter.planterIdentifier = planterIdentifier;
    filter.status = status;
    filter.dateStart = dateStart? formatDate(dateStart) : undefined;
    filter.dateEnd = dateEnd? formatDate(dateEnd) : undefined;
    filter.approved = approved;
    filter.active = active;
    filter.speciesId = speciesId;
    props.onSubmit && props.onSubmit(filter);
  }

  function handleCloseClick() {
    props.onClose && props.onClose();
  }

  return (
    <React.Fragment>
      {
        <Grid container>
          <Grid item className={classes.inputContainer}>
            <TextField
              select
              className={`${classes.textFieldSelect} ${classes.filterElement}`}
              label='Approved'
              value={
                approved === undefined ? 'All' : approved === true ? 'true' : 'false'
              }
              onChange={e =>
                setApproved(
                  e.target.value === 'All'
                    ? undefined
                    : e.target.value === 'true'
                    ? true
                    : false
                )
              }
            >
              {['All', 'true', 'false'].map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              className={`${classes.textFieldSelect} ${classes.filterElement}`}
              label='Rejected'
              value={
                active === undefined ? 'All' : active === true ? 'false' : 'true'
              }
              InputLabelProps={{
                shrink: true
              }}
              onChange={e =>
                setActive(
                  e.target.value === 'All'
                    ? undefined
                    : e.target.value === 'true'
                    ? false
                    : true
                )
              }
            >
              {['All', 'false', 'true'].map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={getDatePickerLocale()}>
              <KeyboardDatePicker
                margin='normal'
                id='start-date-picker'
                label='Start Date'
                format={getDateFormatLocale(true)}
                value={dateStart}
                onChange={handleDateStartChange}
                maxDate={dateEnd}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
                className={`${classes.dateInput} ${classes.filterElement}`}
              />
              <KeyboardDatePicker
                className={`${classes.filterElement}`}
                margin='normal'
                id='end-date-picker'
                label='End Date'
                format={getDateFormatLocale(true)}
                value={dateEnd}
                onChange={handleDateEndChange}
                minDate={dateStart}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
                className={`${classes.dateInput} ${classes.filterElement}`}
              />
            </MuiPickersUtilsProvider>
            <TextField
              className={`${classes.textField} ${classes.filterElement}`}
              label='Planter ID'
              placeholder='Planter ID'
              value={planterId}
              onChange={e => setPlanterId(e.target.value)}
            />
            <TextField
              className={`${classes.textField} ${classes.filterElement}`}
              label='Tree ID'
              placeholder='e.g. 80'
              value={treeId}
              onChange={e => setTreeId(e.target.value)}
            />
            <TextField
              className={`${classes.textField} ${classes.filterElement}`}
              label='Device ID'
              placeholder='device id'
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
            />
            <TextField
              className={`${classes.textField} ${classes.filterElement}`}
              label='Planter Identifier'
              placeholder='planter identifier'
              value={planterIdentifier}
              onChange={e => setPlanterIdentifier(e.target.value)}
            />
            <TextField
              select
              className={`${classes.textFieldSelect} ${classes.filterElement}`}
              label='Species'
              value={speciesId}
              onChange={e =>
                setSpeciesId(e.target.value)
              }
            >
              {[{id:0,name:'all'}, ...props.speciesState.speciesList].map(species => (
                <MenuItem key={species.id} value={species.id}>
                  {species.name}
                </MenuItem>
              ))}
            </TextField>
            <Button 
              className={classes.apply}
              variant='outlined' color='primary' onClick={handleSubmit}>
              Apply 
            </Button>
          </Grid>
        </Grid>
      }
    </React.Fragment>
  )

}

//export default compose(
//  withStyles(styles, { withTheme: true, name: 'Filter' })
//)(Filter)
export default withStyles(styles)(connect(
  //state
  state => ({
    speciesState: state.species
  }),
  //dispatch
  dispatch => ({
  })
)(Filter));
