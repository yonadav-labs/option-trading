import React from "react";
import { Select, FormControl, MenuItem, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 120,
        backgroundColor: "#53555d", 
        borderRadius: 5,
    },
}));

export default function MaterialFilter({options, defaultValue, onFilterChange}) {
    const classes = useStyles();

    return (
        <FormControl variant="outlined" className={classes.formControl} fullWidth>
            <Select
                defaultValue={defaultValue}
                style={{color: 'white'}}
                onChange={onFilterChange}
            >
                { 
                    options.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem> ) 
                }
            </Select>
        </FormControl>
    );
}
