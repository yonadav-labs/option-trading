import React from "react";
import { Grid, Box } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import MaterialFilter from "./MaterialFilter";
import MaterialTextField from "./MaterialTextField";
import MetricLabel from "../MetricLabel";
import PriceTargetBox from "./PriceTargetBox";


export default function FilterContainer({ onFilterChange, initialPrice }) {
    const premiumPriceFilter = [
        { label: "Market Order Price", value: "market" },
        { label: "Mid/Mark Price", value: 'mid' }
    ]

    const minVolumeFilter = [
        { label: "≥ 1", value: 1 },
        { label: "≥ 5", value: 5 },
        { label: "≥ 10", value: 10 },
        { label: "≥ 50", value: 50 },
        { label: "≥ 100", value: 100 },
        { label: "≥ 500", value: 500 },
        { label: "≥ 1000", value: 1000 },
        { label: "≥ 5000", value: 5000 },
    ]

    const minInterestFilter = [
        { label: "≥ 10", value: 10 },
        { label: "≥ 50", value: 50 },
        { label: "≥ 100", value: 100 },
        { label: "≥ 500", value: 500 },
        { label: "≥ 1000", value: 1000 },
        { label: "≥ 5000", value: 5000 },
    ]

    const lastTradedFilter = [
        { label: "All", value: -9999999 },
        { label: "Last Traded in 1 Days", value: -1 },
        { label: "Last Traded in 5 Days", value: -5 },
        { label: "Last Traded in 10 Days", value: -10 },
    ]

    const max10PctLossFilter = [
        { label: "All", value: -1.0 },
        { label: "≥ -5%", value: -0.05 },
        { label: "≥ -10%", value: -0.1 },
        { label: "≥ -20%", value: -0.2 },
        { label: "≥ -40%", value: -0.2 },
        { label: "≥ -60%", value: -0.5 },
        { label: "≥ -80%", value: -0.8 },
    ]

    return (
        <>
            <Box pb={2}>
                <Grid item>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item><span style={{ fontSize: '1.3rem' }}>SETTINGS</span></Grid>
                        <Grid item><TuneIcon fontSize="large" /> </Grid>
                    </Grid>
                </Grid>
            </Box>
            <PriceTargetBox onFilterChange={onFilterChange} initialPrice={initialPrice} />
            <Box py={2}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"premium price options"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'premium')} options={premiumPriceFilter} defaultValue={"market"} />
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"min volume"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'volume')} options={minVolumeFilter} defaultValue={1} />
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"min open interest"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'interest')} options={minInterestFilter} defaultValue={10} />
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"10% chance loss"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'tenPercentWorstReturnRatio')} options={max10PctLossFilter} defaultValue={-1.0} />
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"cash to invest"} />
                </Grid>
                <Grid item>
                    <MaterialTextField onFilterChange={onFilterChange} placeholder="0 (optional)" />
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{ paddingBottom: '0.3rem' }}>
                    <MetricLabel label={"time since last traded"} />
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'lastTraded')} options={lastTradedFilter} defaultValue={-9999999} />
                </Grid>
            </Box>
        </>
    );
}
