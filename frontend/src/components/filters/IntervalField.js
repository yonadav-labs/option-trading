import React from "react";
import { OutlinedInput, makeStyles, InputAdornment } from "@material-ui/core";
import { PercentageFormatter } from "../../utils";

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
        }
    }
}));

export default function IntervalField({ initialPrice, value, onValueChange }) {
    const classes = useStyles();

    return (
        <> 
            <OutlinedInput
                className={classes.customInput}
                type="number"
                fullWidth
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                // defaultValue={0}
                startAdornment={<InputAdornment position="start"> <span style={{color: "#cdcece"}}>+/- <span style={{color: "white"}}>$</span></span> </InputAdornment>}
                endAdornment={
                    <InputAdornment position="end">
                        <span style={{color: "#cdcece"}}>{PercentageFormatter(value/initialPrice)}</span>
                    </InputAdornment>
                }
            />
        </>
    );
}
