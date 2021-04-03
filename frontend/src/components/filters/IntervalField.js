import React from "react";
import { OutlinedInput, makeStyles, InputAdornment } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        background: "#53555d",
        borderRadius: 5,
        color: "white"
    }
}));

export default function IntervalField({ initialPrice, intervalValue, intervalValueChangeHandler }) {
    const classes = useStyles();

    return (
        <> 
            <OutlinedInput
                className={classes.root}
                type="number"
                fullWidth
                value={intervalValue}
                onChange={(e) => intervalValueChangeHandler(e.target.value)}
                defaultValue={0}
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
