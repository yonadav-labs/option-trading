import React from "react";
import { Select, FormControl, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
    formControl: {
        width: '100%'
    },
    customSelect: {
        color: 'white',
        background: 'rgba(255, 255, 255, 0.15)',
    }
}));

export default function MaterialFilter({ options, value, defaultValue, onFilterChange }) {
    const classes = useStyles();

    return (
        <FormControl variant="outlined" className={classes.formControl}>
            <Select
                defaultValue={defaultValue}
                className={classes.customSelect}
                onChange={onFilterChange}
                value={value}
            >
                {
                    options.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)
                }
            </Select>
        </FormControl>
    );
}
