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
                style={{ width: '100%' }}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                // defaultValue={0}
                startAdornment={<InputAdornment position="start"> <span style={{ color: "#8f8f8f" }}>+/- <span style={{ color: "white" }}>$</span></span> </InputAdornment>}
                endAdornment={
                    <InputAdornment position="end">
                        <span style={{ color: "#8f8f8f" }}>{PercentageFormatter(value / initialPrice)}</span>
                    </InputAdornment>
                }
            />
        </>
    );
}
