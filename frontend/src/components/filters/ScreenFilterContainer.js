import React from "react";
import { Grid, Box, IconButton, Typography, makeStyles, FormControl, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Chip } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@material-ui/icons/Cancel';
import MaterialFilter from "./MaterialFilter";
import MetricLabel from "../MetricLabel";
import TickerAutocomplete from "../TickerAutocomplete";
import { GetGaEventTrackingFunc } from '../../utils';
import PriceTargetField from "./PriceTargetField";


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
    },
    chip: {
        backgroundColor: "#FFF",
        marginRight: 2,
    }
}))

export default function ScreenFilterContainer(props) {
    const classes = useStyles();
    const {
        onFilterChange,
        onPutToggle,
        onCallToggle,
        initialPrice,
        filters,
        handleFilterCollapse,
        isMobile,
        handleMobileFilterCollapse,
        allTickers,
        onTickerSelectionChange,
        selectedTicker,
        expirationTimestampsOptions,
        selectedExpirationTimestamps,
        onExpirationSelectionChange,
        debouncedGetContracts,
        deleteExpirationChip,
    } = props

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

    const maxBidAskSpreadFilterOptions = [
        { label: "All", value: 99999 },
        { label: "≤ $0.01", value: 0.01 },
        { label: "≤ $0.02", value: 0.02 },
        { label: "≤ $0.05", value: 0.05 },
        { label: "≤ $0.1", value: 0.1 },
        { label: "≤ $0.2", value: 0.2 },
        { label: "≤ $0.5", value: 0.5 },
        { label: "≤ $1", value: 1 },
        { label: "≤ $2", value: 2 },
        { label: "≤ $5", value: 5 },
        { label: "≤ $10", value: 10 },
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
                                    value={selectedExpirationTimestamps}
                                    fullWidth
                                    placeholder="Select an expiration date"
                                    onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                    onClose={debouncedGetContracts}
                                    variant="outlined"
                                    className={classes.select}
                                    MenuProps={{
                                        anchorOrigin: {
                                            vertical: "bottom",
                                            horizontal: "left"
                                        },
                                        getContentAnchorEl: () => null,
                                    }}
                                    renderValue={
                                        (selectedExpirationTimestamps) => {
                                            let sorted = selectedExpirationTimestamps.sort((a, b) => (a.value > b.value) ? 1 : -1)
                                            return (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                                    {sorted.map((date) => (
                                                        <Chip
                                                            key={date.value}
                                                            label={date.label}
                                                            className={classes.chip}
                                                            clickable
                                                            deleteIcon={
                                                                <CancelIcon
                                                                    onMouseDown={(event) => event.stopPropagation()}
                                                                />
                                                            }
                                                            onDelete={(e) => deleteExpirationChip(e, date.value)}
                                                        />
                                                    ))}
                                                </Box>
                                            )
                                        }
                                    }
                                >
                                    {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Box>
                </Box>
                :
                null
            }
            <Box paddingTop="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="type" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <FormGroup>
                        <Grid container>
                            <Grid item xs={6}>
                                <FormControlLabel control={<Checkbox checked={filters.callToggle} color="primary" onChange={onCallToggle} />} label="Call" />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel control={<Checkbox checked={filters.putToggle} color="primary" onChange={onPutToggle} />} label="Put" />
                            </Grid>
                        </Grid>
                    </FormGroup>
                </Grid>
            </Box>
            <Box paddingBottom="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min strike" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <PriceTargetField onValueChange={(event) => onFilterChange(event, 'minStrike')}
                        initialPrice={initialPrice} value={filters.minStrike} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="max strike" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <PriceTargetField onValueChange={(event) => onFilterChange(event, 'maxStrike')}
                        initialPrice={initialPrice} value={filters.maxStrike} />
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
                    <Typography variant="button"><MetricLabel label="max bid ask spread" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'maxBidAskSpread')}
                        options={maxBidAskSpreadFilterOptions} value={filters.maxBidAskSpread} defaultValue={99999} />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="delta" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'delta')}
                        options={deltaFilterOptions} value={filters.delta} defaultValue={1} />
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
