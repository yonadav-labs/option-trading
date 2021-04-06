import React, {useState, useCallback} from "react";
import { OutlinedInput, makeStyles, InputAdornment } from "@material-ui/core";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
    customInput: {
        color: 'white',
        background: 'rgba(255, 255, 255, 0.15)',
    }
}));

export default function DollarInputField({ onFilterChange, placeholder }) {
    const classes = useStyles();
    const [value, setValue] = useState('')

    // function to send fetch after 2 seconds
    const delayedQuery = useCallback(_.debounce(q => onFilterChange(q, "cash"), 2000), []);
    const changeHandler = (e) => {
        const val = parseFloat(e.target.value) || 0
        setValue(val);
        delayedQuery(val)
    };

    return (
        <OutlinedInput
            className={classes.customInput}
            placeholder={placeholder}
            inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
            }}
            fullWidth
            value={value}
            onChange={changeHandler}
            startAdornment={<InputAdornment position="start"> <span style={{color: "white"}}>$</span></InputAdornment>}
        />
    );
}
