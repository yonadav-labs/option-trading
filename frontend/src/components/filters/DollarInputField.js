import React, {useState } from "react";
import { OutlinedInput, makeStyles, InputAdornment } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    customInput: {
        color: 'white',
        background: 'rgba(255, 255, 255, 0.15)',
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: 0
        },
        "& input[type=number]": {
            "-moz-appearance": "textfield"
        },
        width: "100%"
    }
}));

export default function DollarInputField({ onFilterChange, placeholder }) {
    const classes = useStyles();
    const [value, setValue] = useState('')

    const changeHandler = (e) => {
        const val = parseFloat(e.target.value) || 0
        setValue(val);
        onFilterChange(val, "cashToInvest")
    };

    return (
        <OutlinedInput
            className={classes.customInput}
            placeholder={placeholder}
            type="number"
            value={value}
            onChange={changeHandler}
            startAdornment={<InputAdornment position="start"> <span style={{color: "white"}}>$</span></InputAdornment>}
        />
    );
}
