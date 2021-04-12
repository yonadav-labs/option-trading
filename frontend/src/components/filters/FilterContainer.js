import React from "react";
import { Grid, Box } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import MaterialFilter from "./MaterialFilter";
import DollarInputField from "./DollarInputField";
import MetricLabel from "../MetricLabel";
import TargetBox from "./TargetBox";


export default function FilterContainer({ onFilterChange, initialPrice, filters }) {
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
        { label: "All", value: -1.0 },
        { label: "≥ -5%", value: -0.05 },
        { label: "≥ -10%", value: -0.1 },
        { label: "≥ -20%", value: -0.2 },
        { label: "≥ -40%", value: -0.4 },
        { label: "≥ -60%", value: -0.6 },
        { label: "≥ -80%", value: -0.8 },
    ];

    const filterChangeHandler = (event, key) => {
        onFilterChange(event.target.value, key)
    }

    return (
        <>
            <Box py={2} style={{width: "90%"}}>
                <Grid item>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item><span style={{ fontSize: '1.3rem' }}>SETTINGS</span></Grid>
                        <Grid item><TuneIcon fontSize="large" /> </Grid>
                    </Grid>
                </Grid>
            </Box>
            <TargetBox onFilterChange={onFilterChange} initialPrice={initialPrice} filters={filters}/>
            <Box py={2} style={{width: "90%"}}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"premium price options"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'premiumType')} options={premiumPriceFilter} value={filters.premiumType} defaultValue={"market"} />
                </Grid>
            </Box>
            <Box py={2} style={{width: "90%"}}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"volume"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minVolume')} options={minVolumeFilter} value={filters.minVolume} defaultValue={0} />
                </Grid>
            </Box>
            <Box py={2} style={{width: "90%"}}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"open interest"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'minOpenInterest')} options={minInterestFilter} value={filters.minOpenInterest} defaultValue={0} />
                </Grid>
            </Box>
            <Box py={2} style={{width: "90%"}}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"10% chance loss"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'tenPercentWorstReturnRatio')} options={max10PctLossFilter} value={filters.tenPercentWorstReturnRatio} defaultValue={-1.0} />
                </Grid>
            </Box>
            <Box py={2} style={{width: "90%"}}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"cash to invest"} />
                </Grid>
                <Grid item>
                    <DollarInputField onFilterChange={onFilterChange} placeholder="0 (optional)" value={filters.cashToInvest}/>
                </Grid>
            </Box>
            <Box py={2} style={{width: "90%"}}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"time since last traded"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => filterChangeHandler(event, 'lastTraded')} options={lastTradedFilter} value={filters.lastTradedDate} defaultValue={-9999999} />
                </Grid>
            </Box>
        </>
    );
}
