import React from "react";
import { Select, FormControl, MenuItem, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 120
    },
    customSelect: {
        color: 'white',
        background: 'rgba(255, 255, 255, 0.15)',
    }
}));

export default function MaterialFilter({options, defaultValue, onFilterChange}) {
    const classes = useStyles();

    return (
        <FormControl variant="outlined" className={classes.formControl} fullWidth>
            <Select
                defaultValue={defaultValue}
                className={classes.customSelect}
                onChange={onFilterChange}
            >
                { 
                    options.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem> ) 
                }
            </Select>
        </FormControl>
    );
}
