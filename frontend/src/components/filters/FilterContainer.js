import React from "react";
import { Grid, Box, makeStyles } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import MaterialFilter from "./MaterialFilter";
import MaterialTextField from "./MaterialTextField";
import MetricLabel from "../MetricLabel";

export default function FilterContainer({onFilterChange, filters}) {
    const premiumPriceFilter = [
        {label: "Market Order Price", value: "market"},
        {label: "Mid/Mark Price", value: 'mid'}
    ]

    // const strategyTypeFilter = [
    //     {label: "All", value: "all"},
    //     {label: "Long Call", value: "long_call"},
    //     {label: "Covered Call", value: "covered_call"},
    //     {label: "Long Put", value: "long_put"},
    //     {label: "Cash Secured Put", value: "cash_secured_put"},
    //     {label: "Bull Call Spread", value: "bull_call_spread"},
    //     {label: "Bear Call Spread", value: "bear_call_spread"},
    //     {label: "Bear Put Spread", value: "bear_put_spread"},
    //     {label: "Bull Put Spread", value: "bull_put_spread"},
    // ]

    const minVolumeFilter = [
        {label: "≥ 1", value: 1},
        {label: "≥ 10", value: 10},
        {label: "≥ 50", value: 50},
        {label: "≥ 100", value: 100},
        {label: "≥ 200", value: 200},
        {label: "≥ 500", value: 500},
        {label: "≥ 1000", value: 1000},
        {label: "≥ 5000", value: 5000},
    ]

    const minInterestFilter = [
        {label: "≥ 10", value: 10},
        {label: "≥ 50", value: 50},
        {label: "≥ 100", value: 100},
        {label: "≥ 200", value: 200},
        {label: "≥ 500", value: 500},
        {label: "≥ 1000", value: 1000},
        {label: "≥ 5000", value: 5000},
    ]

    const lastTradedFilter = [
        {label: "All", value: -9999999},
        {label: "Last Traded in 1 Days", value: -1},
        {label: "Last Traded in 2 Days", value: -2},
        {label: "Last Traded in 3 Days", value: -3},
        {label: "Last Traded in 4 Days", value: -4},
        {label: "Last Traded in 5 Days", value: -5},
        {label: "Last Traded in 6 Days", value: -6},
        {label: "Last Traded in 7 Days", value: -7},
        {label: "Last Traded in 10 Days", value: -10},
    ]

    return (
        <>
            <Box pb={2}>
            <Grid item>
                <Grid container direction="row" justify="space-between" alignItems="center">
                    <Grid item><span style={{fontSize: '1.3rem'}}>SETTINGS</span></Grid>
                    <Grid item><TuneIcon fontSize="large"/> </Grid>
                </Grid>
            </Grid>
            </Box>
            <Box p={4} py={3} bgcolor='#14161b' mx={-4}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"price range on exp day"}/>
                </Grid>
                <Grid item style={{paddingBottom: '0.5rem'}}>
                    <MaterialTextField onFilterChange={onFilterChange}/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"premium price options"}/>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'premium')} options={premiumPriceFilter} defaultValue={"market"}/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"cash to invest"}/>
                </Grid>
                <Grid item>
                    <MaterialTextField onFilterChange={onFilterChange}/>
                </Grid>
            </Box>
            {/* <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"strategy type"}/>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'strategy')} options={strategyTypeFilter} defaultValue={"all"}/>
                </Grid>
            </Box> */}
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"min volume"}/>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'volume')} options={minVolumeFilter} defaultValue={1}/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"min open interest"}/>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'interest')} options={minInterestFilter} defaultValue={10}/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    <MetricLabel label={"time since last traded"}/>
                </Grid>
                <Grid item>
                    <MaterialFilter onFilterChange={(event) => onFilterChange(event, 'lastTraded')} options={lastTradedFilter} defaultValue={-9999999}/>
                </Grid>
            </Box>
        </>
    );
}
