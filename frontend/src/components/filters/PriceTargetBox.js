import React, { useState, useContext } from "react";
import { Box, Grid, ToggleButtonGroup, ToggleButton, Typography, styled } from "@material-ui/core";
import { Link } from 'react-router-dom';
import { withStyles } from "@material-ui/styles";

import MetricLabel from "../MetricLabel";
import PriceTargetField from "./PriceTargetField";
import UserContext from '../../UserContext';
import { GetGaEventTrackingFunc } from '../../utils';

const GaEvent = GetGaEventTrackingFunc('strategy screener');

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    width: "100%",
    padding: theme.spacing(1),
    // "& .MuiToggleButtonGroup-groupedHorizontal": {
    //     "&:not(:last-child)": {
    //         borderRadius: 30
    //     },
    //     "&:not(:first-child)": {
    //         borderRadius: 30
    //     }
    // }
}));
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


export default function PriceTargetBox(props) {
    const {
        value,
        setValue,
        initialPrice
    } = props;

    const [targetType, setTargetType] = useState('price');

    const { user } = useContext(UserContext);

    const handleTargetTypeChange = (event, newTargetType) => {
        if (newTargetType !== null) {
            GaEvent('adjust target price toggle ' + newTargetType);
            setTargetType(newTargetType);
        }
    }

    const priceTargetChangeHandler = (e) => {
        GaEvent('adjust price target');
        const val = parseFloat(e);
        setValue([val, val]);
    }

    const lowerRangeChangeHandler = (e) => {
        GaEvent('adjust lower price target');
        const val = parseFloat(e);
        setValue([val, value[1]]);
    }

    const upperRangeChangeHandler = (e) => {
        GaEvent('adjust uppper price target');
        const val = parseFloat(e);
        setValue([value[0], val]);
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
                            value={value[0]}
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
                                    value={value[0]}
                                />
                            </Grid>
                            <Grid item paddingBottom='0.1rem'>
                                <Typography variant="button"><MetricLabel label="high price target" /></Typography>
                            </Grid>
                            <Grid item paddingBottom='0.4rem'>
                                <PriceTargetField
                                    onValueChange={upperRangeChangeHandler}
                                    initialPrice={initialPrice}
                                    value={value[1]}
                                />
                            </Grid>
                        </> :
                        <>
                            <Link to="/pricing"> Join our Pro membership</Link> to find trades
                            with the best potential returns if the stock price enters a price target range.
                            For example, if the stock price rises by 5% to 10%.
                        </>
                )
            }
        </Box>
    );
}
