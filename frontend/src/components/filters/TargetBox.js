import React, { useState, useEffect } from "react";
import { Box, Grid, withStyles } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab/";
import { fixedFloat } from "../../utils";
import MetricLabel from "../MetricLabel";
import PriceTargetField from "./PriceTargetField";
import IntervalField from "./IntervalField";
import RangeTargetField from "./RangeTargetField";

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


export default function PriceTargetBox({ onFilterChange, initialPrice, filters }) {

    const handleTargetType = (event, newTargetType) => {
        if (newTargetType !== null) {
            onFilterChange(newTargetType, "targetType");
        }
        updateTargetPrices(filters.priceTarget, filters.interval);
    }

    const updateTargetPrices = (priceTarget, interval) => {
        const val = parseFloat(interval) || 0
        const upperPrice = fixedFloat(priceTarget + val);
        const lowerPrice = priceTarget - val < 0 ? 0 : fixedFloat(priceTarget - val);
        onFilterChange(lowerPrice, "targetPriceLower");
        onFilterChange(upperPrice, "targetPriceUpper");
    }

    const intervalChangeHandler = (e) => {
        const val = parseFloat(e);
        onFilterChange(val, 'interval');
        updateTargetPrices(filters.priceTarget, val);
    }
    
    const priceTargetChangeHandler = (e) => {
        const val = parseFloat(e);
        onFilterChange(val, "priceTarget");
        updateTargetPrices(val, filters.interval);
    }

    const lowerRangeChangeHandler = (e) => {
        const val = parseFloat(e);
        onFilterChange(val, "targetPriceLower");
    }

    const upperRangeChangeHandler = (e) => {
        const val = parseFloat(e);
        onFilterChange(val, "targetPriceUpper");
    }

    return (
        <Box bgcolor='rgba(51, 51, 51, 0.75)' style={{width: "100%"}} p={2}>
            <Grid item style={{ paddingBottom: "0.3rem" }}>
                <MetricLabel label={"stock price on exp day"} />
            </Grid>
            <Grid item style={{ paddingBottom: "0.5rem" }}>
                <Box border={1} borderColor="white" borderRadius={30}>
                    <StyledToggleButtonGroup
                        value={filters.targetType}
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
            { filters.targetType === "price" ?
                <>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                    <MetricLabel label={"target"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.5rem" }}>
                        <PriceTargetField
                            onFilterChange={onFilterChange}
                            initialPrice={initialPrice}
                            value={filters.priceTarget}
                            onValueChange={priceTargetChangeHandler}
                        />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                        <MetricLabel label={"Interval (optional)"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.2rem" }}>
                        <IntervalField
                            onFilterChange={onFilterChange}
                            initialPrice={initialPrice}
                            onValueChange={intervalChangeHandler}
                            value={filters.interval}
                        />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                        <span>Range: {filters.interval === 0 || filters.interval === "" ? "None specified" : `$${filters.targetPriceLower.toFixed(2)} - $${filters.targetPriceUpper.toFixed(2)}`}</span>
                    </Grid> 
                </>
                :
                <>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                    <MetricLabel label={"low"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.5rem" }}>
                        <RangeTargetField
                            changeHandler={lowerRangeChangeHandler}
                            initialPrice={initialPrice}
                            priceTargetOptions = {[-0.01, -0.02, -0.05, -0.1, -0.2, -0.5, -1]}
                            value={filters.targetPriceLower}
                        />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.3rem" }}>
                        <MetricLabel label={"high"} />
                    </Grid>
                    <Grid item style={{ paddingBottom: "0.2rem" }}>
                        <RangeTargetField
                            changeHandler={upperRangeChangeHandler}
                            initialPrice={initialPrice}
                            priceTargetOptions = {[0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1]}
                            value={filters.targetPriceUpper}
                        />
                    </Grid>
                </>
            }
        </Box>
    );
}
