import React, {useState, useCallback} from "react";
import { OutlinedInput, makeStyles, InputAdornment, Popover, Box, Grid, Button } from "@material-ui/core";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
    root: {
        background: "#53555d",
        borderRadius: 5,
        color: "white"
    }
}));

export default function PriceTargetFilter({ onFilterChange, initialPrice }) {
    const classes = useStyles();
    const [value, setValue] = useState(initialPrice)

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

    const priceTargetOptions = [0.01, -0.01, 0.02, -0.02, 0.05, -0.05, 0.1, -0.1, 0.2, -0.2, 0.5, -0.5, 1, -1]
    
    // function to send fetch after 2 seconds
    const delayedQuery = useCallback(_.debounce(q => onFilterChange(q, "targetPrice"), 2000), []);
    const changeHandler = (e) => {
        setValue(e.target.value);
        delayedQuery(parseFloat(e.target.value))
    };

    // function to handle popover selection
    const selectHandler = (input) => {
        setValue(input)
        handleClose()
        onFilterChange(parseFloat(input), "targetPrice")
    }

    return (
        <> 
            <OutlinedInput
                className={classes.root}
                type="number"
                fullWidth
                value={value}
                defaultValue={initialPrice}
                onChange={changeHandler}
                onClick={handleClick}
                startAdornment={<InputAdornment position="start"> <span style={{color: "white"}}>$</span></InputAdornment>}
                endAdornment={
                    <InputAdornment position="end">
                        <span style={{color: "#cdcece"}}>{value-initialPrice > 0 ? "+" : null}{((value-initialPrice)/initialPrice).toFixed(2) * 100}%</span>
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
                <Box boxShadow={3} bgcolor="white" p={1} width='300px'>
                    <Grid container> 
                        {priceTargetOptions.map((option, index) => { return (
                            <Grid xs={6} key={index} item>
                                <Button style={{justifyContent: 'space-between'}} fullWidth onClick={() => selectHandler((initialPrice + (initialPrice * option)).toFixed(2))}>
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
