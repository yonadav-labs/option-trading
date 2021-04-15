import React, { useState } from "react";
import { OutlinedInput, makeStyles, InputAdornment, Box, Grid, Button } from "@material-ui/core";
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
    },
    priceButton: {
        justifyContent: 'space-between',
        background: 'transparent',
        color: 'black',
        '&:hover': {
            background: '#fafafa',
        }
    }
}));

export default function PriceTargetField({ initialPrice, onValueChange, value }) {
    const classes = useStyles();
    const [selectBox, setSelectBox] = useState(false)

    const priceTargetOptions = [0.01, -0.01, 0.02, -0.02, 0.05, -0.05, 0.1, -0.1, 0.2, -0.2, 0.5, -0.5, 1, -1]

    // function to handle popover selection
    const selectHandler = (input) => {
        onValueChange(input)
        selectBoxHide()
    }

    const selectBoxShow = () => {
        setSelectBox(true)
    }

    const selectBoxHide = () => {
        setSelectBox(false)
    }

    return (
        <div tabIndex={0} onFocus={selectBoxShow} onBlur={selectBoxHide}>
            <OutlinedInput
                className={classes.customInput}
                type="number"
                fullWidth
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                startAdornment={<InputAdornment position="start"> <span style={{ color: "white" }}>$</span></InputAdornment>}
                endAdornment={
                    <InputAdornment position="end">
                        <span style={{ color: "#cdcece" }}>{value - initialPrice > 0 ? "+" : null}{PercentageFormatter((value - initialPrice) / initialPrice)}</span>
                    </InputAdornment>
                }
            />
            {selectBox ?
                <Grid container spacing={1} boxShadow={3} p={1} bgcolor="white" width='300px' zIndex={20} position="absolute">
                    {priceTargetOptions.map((option, index) => {
                        return (
                            <Grid xs={6} key={index} item>
                                <Button className={classes.priceButton} fullWidth onMouseDown={() => selectHandler((initialPrice + (initialPrice * option)).toFixed(2))}>
                                    <span>${(initialPrice + (initialPrice * option)).toFixed(2)}</span> <span style={{ color: "#cdcece" }}>{option > 0 ? "+" : null}{option * 100}%</span>
                                </Button>
                            </Grid>
                        )
                    })}
                </Grid>
                :
                null
            }
        </div>
    );
}
