import React, { useState, useContext } from "react";
import { Box, Grid, ToggleButtonGroup, ToggleButton, Typography, useTheme } from "@material-ui/core";
import { Link } from 'react-router-dom';
import { withStyles } from "@material-ui/styles";

import MetricLabel from "../MetricLabel";
import PriceTargetField from "./PriceTargetField";
import UserContext from '../../UserContext';
import { GetGaEventTrackingFunc } from '../../utils';

const GaEvent = GetGaEventTrackingFunc('strategy screener');

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
    const theme = useTheme();
    const StyledToggleButtonGroup = withStyles({
        root: {
            width: "100%",
            padding: theme.spacing(1)
        },
        groupedHorizontal: {
            "&:not(:last-child)": {
                borderRadius: 30
            },
            "&:not(:first-child)": {
                borderRadius: 30
            }
        }
    }, theme)(ToggleButtonGroup);
    const [targetType, setTargetType] = useState('price');

    const { user } = useContext(UserContext);

    const handleTargetTypeChange = (event, newTargetType) => {
        if (newTargetType !== null) {
            GaEvent('adjust target price toggle ' + newTargetType);
            setTargetType(newTargetType);
            updateRangeByPrice(filters.targetPriceLower);
        }
    }

    const updateRangeByPrice = (priceTarget) => {
        onFilterChange(priceTarget, "targetPriceLower");
        onFilterChange(priceTarget, "targetPriceUpper");
    }

    const priceTargetChangeHandler = (e) => {
        GaEvent('adjust price target');
        const val = parseFloat(e);
        onFilterChange(val, "priceTarget");
        updateRangeByPrice(val);
    }

    const lowerRangeChangeHandler = (e) => {
        GaEvent('adjust lower price target');
        const val = parseFloat(e);
        onFilterChange(val, "targetPriceLower");
    }

    const upperRangeChangeHandler = (e) => {
        GaEvent('adjust uppper price target');
        const val = parseFloat(e);
        onFilterChange(val, "targetPriceUpper");
    }

    return (
        <Box width="100%" paddingY="0.5rem">
            <Grid item paddingBottom='0.1rem'>
                <Typography variant="button"><MetricLabel label="price target on exp day" /></Typography>
            </Grid>
            <Grid item>
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
                        Range (Pro)
                    </StyledToggleButton>
                </StyledToggleButtonGroup>
            </Grid>
            {targetType === "price" ?
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
                (
                    user && user.subscription ?
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
                        </> :
                        <>
                            <Link to="/pricing"> Join our Pro membership</Link> to find trades
                            with the best potential returns if stock price hit within a price target range.
                            For example, if stock price raise by 5% to 10%.
                        </>
                )
            }
        </Box>
    );
}
