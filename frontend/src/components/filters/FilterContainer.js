import React from "react";
import { Grid, Box, IconButton, Typography, makeStyles, FormControl, Select, MenuItem } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import CloseIcon from '@material-ui/icons/Close';
import MaterialFilter from "./MaterialFilter";
import DollarInputField from "./DollarInputField";
import MetricLabel from "../MetricLabel";
import TargetBox from "./TargetBox";
import TickerAutocomplete from "../TickerAutocomplete";
import { GetGaEventTrackingFunc } from '../../utils';

const GaEvent = GetGaEventTrackingFunc('strategy screener');

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
    }
}))

export default function FilterContainer(props) {
    const classes = useStyles();
    const {
        onFilterChange,
        initialPrice,
        filters,
        handleFilterCollapse,
        isMobile,
        handleMobileFilterCollapse,
        allTickers,
        onTickerSelectionChange,
        selectedTicker,
        expirationTimestampsOptions,
        selectedExpirationTimestamp,
        onExpirationSelectionChange
    } = props

    const premiumPriceFilterOptions = [
        { label: "Market Order Price", value: "market" },
        { label: "Mid/Mark Price", value: 'mid' }
    ];

    const minTargetPriceProfitRatio = [
        { label: "All", value: 0.0 },
        { label: "≥ 1%", value: 0.01 },
        { label: "≥ 2%", value: 0.02 },
        { label: "≥ 5%", value: 0.05 },
        { label: "≥ 10%", value: 0.1 },
        { label: "≥ 20%", value: 0.2 },
        { label: "≥ 50%", value: 0.5 },
        { label: "≥ 100%", value: 1 },
        { label: "≥ 200%", value: 2 },
        { label: "≥ 500%", value: 5 },
    ];

    const minProfitProbOptions = [
        { label: "All", value: 0.0 },
        { label: "≥ 5%", value: 0.05 },
        { label: "≥ 10%", value: 0.1 },
        { label: "≥ 20%", value: 0.2 },
        { label: "≥ 30%", value: 0.3 },
        { label: "≥ 40%", value: 0.4 },
        { label: "≥ 50%", value: 0.5 },
        { label: "≥ 60%", value: 0.6 },
        { label: "≥ 70%", value: 0.7 },
        { label: "≥ 80%", value: 0.8 },
        { label: "≥ 90%", value: 0.9 },
    ];

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

    const filterChangeHandler = (event, key) => {
        GaEvent('adjust filter ' + key);
        onFilterChange(event.target.value, key)
    }

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
                            <FormControl fullWidth>
                                <Select
                                    id="expiration-dates"
                                    value={selectedExpirationTimestamp}
                                    fullWidth
                                    placeholder="Select an expiration date"
                                    onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                    variant="outlined"
                                    className={classes.select}
                                >
                                    <MenuItem disabled value={"none"}><span style={{ color: "gray" }}>Select an expiration date</span></MenuItem>
                                    {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Box>
                </Box>
                :
                null
            }

            <TargetBox onFilterChange={onFilterChange} initialPrice={initialPrice} filters={filters} />
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="hypothetical return" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minTargetPriceProfitRatio')}
                        options={minTargetPriceProfitRatio} value={filters.minTargetPriceProfitRatio} defaultValue={0} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="probability of profit" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minProfitProb')}
                        options={minProfitProbOptions} value={filters.minProfitProb} defaultValue={0} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min volume" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minVolume')}
                        options={minVolumeFilterOptions} value={filters.minVolume} defaultValue={0} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min open interest" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minOpenInterest')}
                        options={minInterestFilterOptions} value={filters.minOpenInterest} defaultValue={0} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="premium price options" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'premiumType')}
                        options={premiumPriceFilterOptions} value={filters.premiumType} defaultValue={"market"} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="cash to invest" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <DollarInputField onFilterChange={onFilterChange} placeholder="0 (optional)" value={filters.cashToInvest} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="time since last traded" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'lastTraded')}
                        options={lastTradedFilterOptions} value={filters.lastTradedDate} defaultValue={-9999999} />
                </Grid>
            </Box>
        </div>
    );
}
