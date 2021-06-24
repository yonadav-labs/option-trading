import React, { useState } from "react";
import { Grid, Box, IconButton, Typography, Slider } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import CloseIcon from '@material-ui/icons/Close';
import MaterialFilter from "./MaterialFilter";
import MetricLabel from "../MetricLabel";
import TickerAutocomplete from "../TickerAutocomplete";
import { GetGaEventTrackingFunc, PriceFormatter } from '../../utils';
import { makeStyles } from "@material-ui/styles";
import Moment from 'react-moment';


const GaEvent = GetGaEventTrackingFunc('surface');

const useStyles = makeStyles(theme => ({
    autocomplete: {
        "& label": {
            color: 'white',
        },
        "&.MuiAutocomplete-root .MuiAutocomplete-inputRoot": {
            color: 'white',
            background: 'rgba(255, 255, 255, 0.15)',
        },
        "&.MuiAutocomplete-root .Mui-focused .MuiAutocomplete-clearIndicator": {
            color: 'white',
        },
    },
    select: {
        "&.MuiOutlinedInput-root": {
            color: 'white',
            background: 'rgba(255, 255, 255, 0.15)',
        }
    },
    chip: {
        backgroundColor: "#FFF",
        marginRight: 2,
    }
}))

export default function SurfaceFilterContainer(props) {
    const classes = useStyles();
    const {
        onFilterChange,
        initialPrice,
        handleFilterCollapse,
        isMobile,
        handleMobileFilterCollapse,
        allTickers,
        onTickerSelectionChange,
        selectedTicker,
        expirationTimestampsOptions
    } = props

    const [strikeValues, setStrikeValues] = useState([0, Math.ceil(initialPrice * 2)]);

    const lastExpirationDate = expirationTimestampsOptions[expirationTimestampsOptions.length - 1];
    const [expirationDates, setExpirationDates] = useState([expirationTimestampsOptions[0].value, lastExpirationDate.value]);

    const handleStrikeChange = (event, newValue) => {
        setStrikeValues(newValue);
    };

    const submitStrikeChange = () => {
        onFilterChange(strikeValues[0], 'minStrike')
        onFilterChange(strikeValues[1], 'maxStrike')
    }

    const handleExpirationDateChange = (event, newValue) => {
        setExpirationDates(newValue);
    }

    const submitExpirationDateChange = () => {
        onFilterChange(expirationDates[0], 'minExpiration')
        onFilterChange(expirationDates[1], 'maxExpiration')
    }

    const minVolumeFilterOptions = [
        { label: "All", value: 0 },
        { label: "≥ 1", value: 1 },
        { label: "≥ 5", value: 5 },
        { label: "≥ 10", value: 10 },
        { label: "≥ 50", value: 50 },
        { label: "≥ 100", value: 100 },
        { label: "≥ 500", value: 500 },
        { label: "≥ 1000", value: 1000 },
        { label: "≥ 5000", value: 5000 },
    ];

    const minInterestFilterOptions = [
        { label: "All", value: 0 },
        { label: "≥ 1", value: 1 },
        { label: "≥ 5", value: 5 },
        { label: "≥ 10", value: 10 },
        { label: "≥ 50", value: 50 },
        { label: "≥ 100", value: 100 },
        { label: "≥ 500", value: 500 },
        { label: "≥ 1000", value: 1000 },
        { label: "≥ 5000", value: 5000 },
    ];

    const lastTradedFilterOptions = [
        { label: "All", value: -9999999 },
        { label: "Past 1 Day", value: -1 },
        { label: "Past 5 Days", value: -5 },
        { label: "Past 10 Days", value: -10 },
        { label: "Past 30 Days", value: -30 },
    ];

    const deltaFilterOptions = [
        { label: "All", value: 1 },
        { label: "-1.0 to -0.8", value: -1 },
        { label: "-0.8 to -0.6", value: -0.8 },
        { label: "-0.6 to -0.4", value: -0.6 },
        { label: "-0.4 to -0.2", value: -0.4 },
        { label: "-0.2 to 0.0", value: -0.2 },
        { label: "0.0 to 0.2", value: 0.0 },
        { label: "0.2 to 0.4", value: 0.2 },
        { label: "0.4 to 0.6", value: 0.4 },
        { label: "0.6 to 0.8", value: 0.6 },
        { label: "0.8 to 1.0", value: 0.8 },
    ];

    const filterChangeHandler = (event, key) => {
        GaEvent('adjust filter ' + key);
        onFilterChange(event.target.value, key)
    }

    function formatDate(value) {
        return <Moment date={new Date(value)} format="MM/DD/YY" />;
    }

    const expirationDateMarks = [
        {
            value: expirationTimestampsOptions[0].value,
            label: expirationTimestampsOptions[0].label,
        },
        {
            value: lastExpirationDate.value,
            label: lastExpirationDate.label,
        },
    ];

    const strikeMarks = [
        {
            value: 0,
            label: '$0',
        },
        {
            value: Math.ceil(initialPrice * 2),
            label: `$${(initialPrice * 2).toFixed(0)}`,
        },
    ];

    return (
        <div style={{ paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "1rem", width: "100%" }} >
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item><Typography variant="h5">Settings</Typography></Grid>
                <Grid item>
                    {isMobile ?
                        <IconButton color="inherit" style={{ height: "max-content" }} onClick={handleMobileFilterCollapse}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                        :
                        <IconButton color="inherit" style={{ height: "max-content" }} onClick={handleFilterCollapse}>
                            <TuneIcon fontSize="large" />
                        </IconButton>}
                </Grid>
            </Grid>
            {isMobile ?
                <Box paddingY="0.5rem">
                    <Box py={0.5}>
                        <Grid item paddingBottom='0.1rem'>
                            <Typography variant="button"><MetricLabel label="ticker symbol" /></Typography>
                        </Grid>
                        <Grid>
                            <TickerAutocomplete
                                tickers={allTickers}
                                onChange={onTickerSelectionChange}
                                size={'medium'}
                                value={selectedTicker}
                                variant="outlined"
                                className={classes.autocomplete}
                            />
                        </Grid>
                    </Box>
                    <Box py={0.5}>
                        <Grid item paddingBottom='0.1rem'>
                            <Typography variant="button"><MetricLabel label="expiration date" /></Typography>
                        </Grid>
                        <Grid>
                        </Grid>
                    </Box>
                </Box>
                :
                null
            }
            <Box paddingBottom="0.25rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="strike price" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.1rem' paddingX="1rem">
                    <Slider
                        value={strikeValues}
                        onChange={handleStrikeChange}
                        onChangeCommitted={submitStrikeChange}
                        valueLabelFormat={PriceFormatter}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        min={0}
                        max={Math.ceil(initialPrice * 2)}
                        marks={strikeMarks}
                    />
                </Grid>
            </Box>
            <Box paddingBottom="0.25rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="expiration date" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.1rem' paddingX="1rem">
                    <Slider
                        value={expirationDates}
                        onChange={handleExpirationDateChange}
                        onChangeCommitted={submitExpirationDateChange}
                        valueLabelFormat={formatDate}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        min={expirationTimestampsOptions[0].value}
                        max={lastExpirationDate.value}
                        marks={expirationDateMarks}
                    />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min volume" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minVolume')}
                        options={minVolumeFilterOptions} defaultValue={0} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min open interest" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minOpenInterest')}
                        options={minInterestFilterOptions} defaultValue={0} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="delta" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'delta')}
                        options={deltaFilterOptions} defaultValue={1} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="time since last traded" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'lastTraded')}
                        options={lastTradedFilterOptions} defaultValue={-9999999} />
                </Grid>
            </Box>
        </div>
    );
}
