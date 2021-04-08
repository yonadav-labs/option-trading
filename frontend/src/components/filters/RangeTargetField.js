import React, { useState } from "react";
import { OutlinedInput, makeStyles, InputAdornment, Popover, Box, Grid, Button } from "@material-ui/core";
import { PercentageFormatter } from "../../utils";

const useStyles = makeStyles((theme) => ({
    root: {
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
    rangeButton: {
        justifyContent: 'space-between',
        background: 'transparent',
        color: 'black',
        '&:hover': {
            background: '#fafafa',
        }
    }
}));

export default function RangeTargetField({ changeHandler, initialPrice, priceTargetOptions, value }) {
    const classes = useStyles();

    // popover functions and variable
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    // function to handle popover selection
    const selectHandler = (input) => {
        changeHandler(input)
        handleClose()
    }

    return (
        <> 
            <OutlinedInput
                className={classes.root}
                type="number"
                fullWidth
                value={value}
                onChange={(e) => changeHandler(e.target.value)}
                onClick={handleClick}
                startAdornment={<InputAdornment position="start"> <span style={{color: "white"}}>$</span></InputAdornment>}
                endAdornment={
                    <InputAdornment position="end">
                        <span style={{color: "#cdcece"}}>{value-initialPrice > 0 ? "+" : null}{PercentageFormatter((value - initialPrice) / initialPrice)}</span>
                    </InputAdornment>
                }
            />
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box boxShadow={3} bgcolor="white" p={1} width='200px'>
                    <Grid container spacing={1}> 
                        {priceTargetOptions.map((option, index) => { return (
                            <Grid xs={12} key={index} item>
                                <Button className={classes.rangeButton} fullWidth onClick={() => selectHandler((initialPrice + (initialPrice * option)).toFixed(2))}>
                                    <span>${(initialPrice + (initialPrice * option)).toFixed(2)}</span> <span style={{color: "#cdcece"}}>{option > 0 ? "+" : null}{option * 100}%</span>
                                </Button>
                            </Grid> 
                        )})}
                    </Grid>
                </Box>
            </Popover>
        </>
    );
}
