import React, {useState, useCallback} from "react";
import { Box, Grid, withStyles } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab/";
import _ from "lodash";
import { fixedFloat } from "../../utils";
import MetricLabel from "../MetricLabel";
import PriceTarget from "./PriceTarget";
import IntervalField from "./IntervalField";
import RangeTarget from "./RangeTarget";

const StyledToggleButtonGroup = withStyles((theme) => ({
    root: {
        width: "100%",
        
    },
    grouped: {
        margin: theme.spacing(0.5)
    },
    groupedHorizontal: {
        "&:not(:last-child)": {
            borderRadius: 30
        },
        "&:not(:first-child)": {
            borderRadius: 30
        }
    }
}))(ToggleButtonGroup);

const StyledToggleButton = withStyles({
    root: {
        color: "white",
        textTransform: "none",
        width: "100%",
        "&$selected": {
            backgroundColor: "white",
            color: "black",
            "&:hover": {
                backgroundColor: "white",
                color: "black",
            },
        },
        "&:focus": {
            outline: "none"
        },
    },
    selected: {},
})(ToggleButton);


export default function TargetBox({ onFilterChange, initialPrice }) {
    const [targetType, setTargetType] = useState('price')
    const [priceTargetValue, setPriceTargetValue] = useState(initialPrice)
    const [intervalValue, setIntervalValue] = useState(0)
    const [interval, setInterval] = useState({
        lower: initialPrice,
        higher: initialPrice
    })

    const handleTargetType = (event, newTargetType) => {
        if (newTargetType !== null) {
            setTargetType(newTargetType)
        }
        if (newTargetType === 'price') {
            intervalValueChangeHandler(intervalValue)
        }
    }

    // function to send fetch after 1 seconds
    const delayedQuery = useCallback(_.debounce((i, t, j) => onFilterChange(i, t, j), 1000), []);

    const intervalValueChangeHandler = (e) => {
        const val = parseFloat(e) || 0
        setIntervalValue(val)
        intervalChangeHandler(priceTargetValue, e)
    }

    const intervalChangeHandler = (target, value) => {
        let floatValue = parseFloat(value)
        let floatTarget = parseFloat(target)
        let lowerPrice 
        let higherPrice = fixedFloat(floatTarget + floatValue)
        if (floatTarget-floatValue < 0) {
            lowerPrice = 0
        } else{
            lowerPrice = fixedFloat(floatTarget - floatValue)
        }
        setInterval({lower: lowerPrice, higher: higherPrice})
        // console.log(floatValue, higherPrice)
        delayedQuery(lowerPrice, "targetPrice", higherPrice)
    }
    
    const priceTargetHandler = (e) => {
        const val = parseFloat(e) || 0
        setPriceTargetValue(val)
        intervalChangeHandler(e, intervalValue)
    }

    const lowerRangeHandler = (e) => {
        const val = parseFloat(e) || 0
        setInterval({...interval, lower: val})
        delayedQuery(val, "lowerTarget")
    }

    const higherRangeHandler = (e) => {
        const val = parseFloat(e) || 0
        setInterval({...interval, higher: val})
        delayedQuery(val, "higherTarget")
    }

    return (
        <Box p={4} py={3} mx={-4} bgcolor='rgba(51, 51, 51, 0.75)'>
            <Grid item style={{ paddingBottom: "0.3rem" }}>
                <MetricLabel label={"stock price on exp day"} />
            </Grid>
            <Grid item style={{ paddingBottom: "0.5rem" }}>
                <Box border={1} borderColor="white" borderRadius={30}>
                    <StyledToggleButtonGroup
                        value={targetType}
                        exclusive
                        color="secondary"
                        onChange={handleTargetType}
                        size="medium"
                    >
                        <StyledToggleButton value="price">
                            Price
                        </StyledToggleButton>
                        <StyledToggleButton value="range">
                            Range
                        </StyledToggleButton>
                    </StyledToggleButtonGroup>
                </Box>
            </Grid>
            { targetType === "price" ?
                <>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                    <MetricLabel label={"target"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.5rem" }}>
                        <PriceTarget
                            onFilterChange={onFilterChange}
                            initialPrice={initialPrice}
                            priceTargetValue={priceTargetValue}
                            priceTargetHandler={priceTargetHandler}
                        />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                        <MetricLabel label={"Interval (optional)"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.2rem" }}>
                        <IntervalField
                            onFilterChange={onFilterChange}
                            initialPrice={initialPrice}
                            intervalValueChangeHandler={intervalValueChangeHandler}
                            intervalValue={intervalValue}
                        />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                        <span>Range: {intervalValue === 0 || intervalValue === "" ? "None specified" : `$${interval.lower} - $${interval.higher}`}</span>
                    </Grid> 
                </>
                :
                <>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                    <MetricLabel label={"low"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.5rem" }}>
                        <RangeTarget
                            changeHandler={lowerRangeHandler}
                            initialPrice={initialPrice}
                            priceTargetOptions = {[-0.01, -0.02, -0.05, -0.1, -0.2, -0.5, -1]}
                            value={interval.lower}
                        />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                        <MetricLabel label={"high"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.2rem" }}>
                        <RangeTarget
                            changeHandler={higherRangeHandler}
                            initialPrice={initialPrice}
                            priceTargetOptions = {[0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1]}
                            value={interval.higher}
                        />
                    </Grid>
                </>
            }
        </Box>
    );
}
