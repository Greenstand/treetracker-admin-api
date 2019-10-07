
import React, { useState } from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {
  DateTimePicker,
} from "@material-ui/pickers";


function DateSelector() {

    const [selectedDate, handleDateChange] = useState(new Date());

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DateTimePicker value={selectedDate} onChange={handleDateChange}/>
    </MuiPickersUtilsProvider>
  );
}


export default DateSelector;