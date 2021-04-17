import React from "react";
import { Grid, Box, TextField, Autocomplete, IconButton, Typography } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import CloseIcon from '@material-ui/icons/Close';
import MaterialFilter from "./MaterialFilter";
import DollarInputField from "./DollarInputField";
import MetricLabel from "../MetricLabel";
import TargetBox from "./TargetBox";
import TickerAutocomplete from "../TickerAutocomplete";

export default function FilterContainer(props) {
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

    const premiumPriceFilter = [
        { label: "Market Order Price", value: "market" },
        { label: "Mid/Mark Price", value: 'mid' }
    ];

    const minVolumeFilter = [
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

    const minInterestFilter = [
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

    const lastTradedFilter = [
        { label: "All", value: -9999999 },
        { label: "Last Traded in 1 Days", value: -1 },
        { label: "Last Traded in 5 Days", value: -5 },
        { label: "Last Traded in 10 Days", value: -10 },
        { label: "Last Traded in 30 Days", value: -30 },
    ];

    const max10PctLossFilter = [
        { label: "Up to 100%", value: -1.0 },
        { label: "Up to 10%", value: -0.1 },
        { label: "Up to 20%", value: -0.2 },
        { label: "Up to 30%", value: -0.3 },
        { label: "Up to 40%", value: -0.4 },
        { label: "Up to 50%", value: -0.5 },
        { label: "Up to 60%", value: -0.6 },
        { label: "Up to 70%", value: -0.7 },
        { label: "Up to 80%", value: -0.8 },
        { label: "Up to 90%", value: -0.9 },
    ];

    const filterChangeHandler = (event, key) => {
        onFilterChange(event.target.value, key)
    }

    return (
        <div style={{ paddingLeft: "1rem", paddingRight: "1rem", width: "100%" }} >
            <Box py={2} style={{ width: "90%" }}>
                <Grid item>
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
                </Grid>
            </Box>
            {isMobile ?
                <>
                    <Box py={2} style={{ width: "90%" }}>
                        <Grid item style={{ paddingBottom: '0.3rem' }}>
                            <Typography variant="button"><MetricLabel label="ticker symbol" /></Typography>
                        </Grid>
                        <Grid item>
                            <TickerAutocomplete
                                tickers={allTickers}
                                onChange={onTickerSelectionChange}
                                size={'medium'}
                                value={selectedTicker}
                            />
                        </Grid>
                    </Box>
                    <Box py={2} style={{ width: "90%" }}>
                        <Grid item style={{ paddingBottom: '0.3rem' }}>
                            <Typography variant="button"><MetricLabel label="expiration date" /></Typography>
                        </Grid>
                        <Grid item>
                            <Autocomplete
                                id="expiration-dates"
                                options={expirationTimestampsOptions}
                                value={selectedExpirationTimestamp}
                                onChange={onExpirationSelectionChange}
                                size="medium"
                                fullWidth
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        placeholder="Select an expiration date"
                                    />
                                )}
                                getOptionLabel={(option) => option.label}
                            />
                        </Grid>
                    </Box>
                </>
                :
                null
            }

            <TargetBox onFilterChange={onFilterChange} initialPrice={initialPrice} filters={filters} />
            <Box>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <Typography variant="button"><MetricLabel label="min volume" /></Typography>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minVolume')} options={minVolumeFilter} value={filters.minVolume} defaultValue={0} />
                </Grid>
            </Box>
            <Box>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <Typography variant="button"><MetricLabel label="min open interest" /></Typography>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minOpenInterest')} options={minInterestFilter} value={filters.minOpenInterest} defaultValue={0} />
                </Grid>
            </Box>
            <Box>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <Typography variant="button"><MetricLabel label="10% probability loss" /></Typography>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'tenPercentWorstReturnRatio')} options={max10PctLossFilter} value={filters.tenPercentWorstReturnRatio} defaultValue={-1.0} />
                </Grid>
            </Box>
            <Box>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <Typography variant="button"><MetricLabel label="premium price options" /></Typography>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'premiumType')} options={premiumPriceFilter} value={filters.premiumType} defaultValue={"market"} />
                </Grid>
            </Box>
            <Box>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <Typography variant="button"><MetricLabel label="cash to invest" /></Typography>
                </Grid>
                <Grid item>
                    <DollarInputField onFilterChange={onFilterChange} placeholder="0 (optional)" value={filters.cashToInvest} />
                </Grid>
            </Box>
            <Box>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <Typography variant="button"><MetricLabel label="time since last traded" /></Typography>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'lastTraded')} options={lastTradedFilter} value={filters.lastTradedDate} defaultValue={-9999999} />
                </Grid>
            </Box>
        </div>
    );
}
