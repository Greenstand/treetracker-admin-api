
import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

export const TAGS_WIDTH = 280

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const useStyles = makeStyles(theme => ({
    root: {
        width: TAGS_WIDTH,
    },
    drawerPaper: {
        width: TAGS_WIDTH,
        padding: theme.spacing(3, 2, 2, 2)
    },
    speciesSelectText: {
        padding: theme.spacing(2, 2, 2, 2),
    },
    speciesSelect: {
        width: 280,
    },
    widthControl: {
        width: 280,
    },
    button: {
        marginRight: 20,
    }

}));

export default function TagsBar(props) {
    const classes = useStyles();
    const [value, setValue] = React.useState('');
    const [approveValue, setApproveValue] = React.useState('');
    const [rejectValue, setRejectValue] = React.useState('');
    const [tabValue, setTabValue] = React.useState(0);
    const [error, setError] = React.useState(false);

    const handleRadioChange = event => {
        setValue(event.target.value);
        setError(false);
    };

    const handleApproveChange = event => {
        setApproveValue(event.target.value);
        setError(false);
    };

    const handleRejectChange = event => {
        setRejectValue(event.target.value);
        setError(false);
    };


    const handleSubmit = event => {
        event.preventDefault();

    };

    const handleSelect = event => {

    };

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };


    return (
        <Grid className={classes.root}>
            <h2>Tags </h2>
            <form onSubmit={handleSubmit}>
                <FormControl component="fieldset" error={error} className={classes.formControl}>
                    <RadioGroup name="tags" value={value} onChange={handleRadioChange}>
                        <FormControlLabel value="seedling" control={<Radio />} label="Seedling" />
                        <FormControlLabel value="directSeeding" control={<Radio />} label="Direct seeding" />
                        <FormControlLabel value="pruned" control={<Radio />} label="Pruned/tied(FMNR)" />
                        <Divider className={classes.widthControl}/>
                        <FormControlLabel value="newTrees" control={<Radio />} label="New tree(s)" />
                        <FormControlLabel value="greatThan2YearsOld" control={<Radio />} label="> 2 years old" />
                        <FormControlLabel value="CreateToken" control={<Radio />} label="Create token" />
                        <FormControlLabel value="noToken" control={<Radio />} label="No token" />
                    </RadioGroup>
                    <Divider className={classes.widthControl}/>
                    <Typography
                        className={classes.speciesSelectText}
                        display="block"
                        variant="h6"
                    >
                        Species (if known)
                        </Typography>

                    <Select
                        labelId="species-select-label"
                        id="species-select-label"
                        className={classes.speciesSelect}
                        value="species"
                        onChange={handleSelect}
                    >
                        <MenuItem value="species1">species1</MenuItem>
                        <MenuItem value="species2">species2</MenuItem>
                        <MenuItem value="species3">species3</MenuItem>
                    </Select>

                    <br />
                    <div className={classes.tap}>
                        <AppBar position="static" className={classes.widthControl} style={{ backgroundColor: "transparent" }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleChange}
                                indicatorColor="primary"
                            >
                                <Tab label="Approve" {...a11yProps(0)} />
                                <Tab label="Reject" {...a11yProps(1)} />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={tabValue} index={0}>
                            <RadioGroup name="approve-option" value={approveValue} onChange={handleApproveChange}>
                                <FormControlLabel value="simpleLeaf" control={<Radio />} label="Simple leaf" />
                                <FormControlLabel value="complexLeaf" control={<Radio />} label="Complex leaf" />
                                <FormControlLabel value="acacia-like" control={<Radio />} label="Acacia-like" />
                                <FormControlLabel value="fruit" control={<Radio />} label="Fruit" />
                                <FormControlLabel value="mangrove" control={<Radio />} label="Mangrove" />
                                <FormControlLabel value="plam" control={<Radio />} label="Plam" />
                                <FormControlLabel value="timber" control={<Radio />} label="Timber" />
                            </RadioGroup>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <RadioGroup name="reject-option" value={rejectValue} onChange={handleRejectChange}>
                                <FormControlLabel value="not-a-tree" control={<Radio />} label="Not a tree" />
                                <FormControlLabel value="not-an-approved-tree" control={<Radio />} label="Not an approved tree" />
                                <FormControlLabel value="flurryPhoto" control={<Radio />} label="Blurry photo" />
                                <FormControlLabel value="dead" control={<Radio />} label="Dead" />
                                <FormControlLabel value="duplicatePhote" control={<Radio />} label="Duplicate photo" />
                                <FormControlLabel value="flagUser" control={<Radio />} label="Flag user!" />
                                <FormControlLabel value="flag-tree-for-contact/review" control={<Radio />} label="Flag tree for contact/review" />
                            </RadioGroup>
                        </TabPanel>
                    </div>
                    <Grid container alignItems="flex-start" justify="flex-end" direction="row">
                        <Button type="submit" variant="outlined" color="primary" className={classes.button}>
                            Submit
                        </Button>
                    </Grid>
                </FormControl>
            </form>
        </Grid>
    );
}
