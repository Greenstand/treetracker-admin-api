import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';

const useStyles = makeStyles({
    root: {
        '& > *' : {
            marginTop: '30px'
        }
    }
});
  

    export default function BasicPagination(props) {
    const classes = useStyles();

    const {currentPage, noOfPages, handleChange} = props
    return (
      <div className={classes.root}>
        <Pagination 
        count={noOfPages}
        page={currentPage}
        onChange={handleChange}
        defaultPage={1}
        color="#666"
        size="small"
        siblingCount={0}
        />
        
      </div>
    );
  }