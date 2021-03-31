import React, {useState, useCallback} from "react";
import { OutlinedInput, makeStyles, InputAdornment } from "@material-ui/core";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
    root: {
        background: "#53555d",
        borderRadius: 5,
        color: "white"
    }
}));

export default function MaterialTextField({ onFilterChange, placeholder }) {
    const classes = useStyles();
    const [value, setValue] = useState('')

    // function to send fetch after 2 seconds
    const delayedQuery = useCallback(_.debounce(q => onFilterChange(q, "cash"), 2000), []);
    const changeHandler = (e) => {
        setValue(e.target.value);
        delayedQuery(parseFloat(e.target.value))
    };

    return (
        <OutlinedInput
            className={classes.root}
            placeholder={placeholder}
            type="number"
            fullWidth
            value={value}
            onChange={changeHandler}
            startAdornment={<InputAdornment position="start"> <span style={{color: "white"}}>$</span></InputAdornment>}
        />
    );
}
