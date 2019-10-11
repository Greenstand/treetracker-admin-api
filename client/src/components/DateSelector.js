
import React from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {
  DateTimePicker,
} from "@material-ui/pickers";


function DateSelector(props) {


  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DateTimePicker value={props.dateValue} onChange={props.dateOnChange}/>
    </MuiPickersUtilsProvider>
  );
}


export default DateSelector;