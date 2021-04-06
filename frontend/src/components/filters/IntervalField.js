import React from "react";
import { OutlinedInput, makeStyles, InputAdornment, Input, TextField } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    customInput: {
        color: 'white',
        background: 'rgba(255, 255, 255, 0.15)',
    }
}));

export default function IntervalField({ initialPrice, intervalValue, intervalValueChangeHandler }) {
    const classes = useStyles();

    return (
        <> 
            <OutlinedInput
                className={classes.customInput}
                inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                }}
                fullWidth
                value={intervalValue}
                onChange={(e) => intervalValueChangeHandler(e.target.value)}
                // defaultValue={0}
                startAdornment={<InputAdornment position="start"> <span style={{color: "#cdcece"}}>+/- <span style={{color: "white"}}>$</span></span> </InputAdornment>}
                endAdornment={
                    <InputAdornment position="end">
                        <span style={{color: "#cdcece"}}>{(intervalValue/initialPrice).toFixed(2) * 100}%</span>
                    </InputAdornment>
                }
            />
        </>
    );
}
