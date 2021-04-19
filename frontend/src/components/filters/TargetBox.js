import React, { useState } from "react";
import { Box, Grid, withStyles, ToggleButtonGroup, ToggleButton, Typography } from "@material-ui/core";
import MetricLabel from "../MetricLabel";
import PriceTargetField from "./PriceTargetField";

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
        margin: 0,
        minHeight: "45px",
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

    const [targetType, setTargetType] = useState('price');

    const handleTargetTypeChange = (event, newTargetType) => {
        if (newTargetType !== null) {
            setTargetType(newTargetType);
            updateRangeByPrice(filters.targetPriceLower);
        }
    }

    const updateRangeByPrice = (priceTarget) => {
        onFilterChange(priceTarget, "targetPriceLower");
        onFilterChange(priceTarget, "targetPriceUpper");
    }

    const priceTargetChangeHandler = (e) => {
        const val = parseFloat(e);
        onFilterChange(val, "priceTarget");
        updateRangeByPrice(val);
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
        <Box width="100%" paddingY="0.5rem">
            <Grid item paddingBottom='0.1rem'>
                <Typography variant="button"><MetricLabel label="price target on exp day" /></Typography>
            </Grid>
            <Grid item paddingBottom="1rem">
                <StyledToggleButtonGroup
                    value={targetType}
                    exclusive
                    color="secondary"
                    onChange={handleTargetTypeChange}
                    size="small"
                >
                    <StyledToggleButton value="price">
                        Price
                        </StyledToggleButton>
                    <StyledToggleButton value="range">
                        Range
                        </StyledToggleButton>
                </StyledToggleButtonGroup>
            </Grid>
            { targetType === "price" ?
                <>
                    <Grid item paddingBottom='0.1rem'>
                        <Typography variant="button"><MetricLabel label="price target" /></Typography>
                    </Grid>
                    <Grid item paddingBottom='0.4rem'>
                        <PriceTargetField
                            initialPrice={initialPrice}
                            value={filters.targetPriceLower}
                            onValueChange={priceTargetChangeHandler}
                        />
                    </Grid>
                </>
                :
                <>
                    <Grid item paddingBottom='0.1rem'>
                        <Typography variant="button"><MetricLabel label="low price target" /></Typography>
                    </Grid>
                    <Grid item paddingBottom='0.4rem'>
                        <PriceTargetField
                            onValueChange={lowerRangeChangeHandler}
                            initialPrice={initialPrice}
                            value={filters.targetPriceLower}
                        />
                    </Grid>
                    <Grid item paddingBottom='0.1rem'>
                        <Typography variant="button"><MetricLabel label="high price target" /></Typography>
                    </Grid>
                    <Grid item paddingBottom='0.4rem'>
                        <PriceTargetField
                            onValueChange={upperRangeChangeHandler}
                            initialPrice={initialPrice}
                            value={filters.targetPriceUpper}
                        />
                    </Grid>
                </>
            }
        </Box>
    );
}
