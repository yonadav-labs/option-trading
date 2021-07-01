import React, { useState } from "react";
import { makeStyles } from '@material-ui/styles';
import { Grid, Typography, Paper, Divider, useMediaQuery, FormControl, Select, MenuItem, Box, Card, Alert } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import NewTickerSummary from "../../components/NewTickerSummary";
import { strategies } from "../../blobs/Strategies";
import { GetGaEventTrackingFunc } from '../../utils';
import BuildLeg from "../../components/BuildLeg";

const GaEvent = GetGaEventTrackingFunc('build');

const useStyles = makeStyles({
    root: {
        overflowX: "auto",
    },
});

export default function MainView(props) {
    const classes = useStyles();

    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        basicInfo,
        selectedStrategy,
        onStrategySelectionChange,
        expirationTimestampsOptions,
        legs,
        updateLeg,
    } = props

    // mobile responsiveness
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
    // mobile responsiveness
    const isCard = useMediaQuery(theme => theme.breakpoints.down('sm'));

    return (
        <Grid container minHeight="inherit">
            <Grid item sm className={classes.root}>
                <Grid component={Paper} container elevation={4} p={3} style={isMobile ? { width: "100vw" } : null}>
                    {isMobile ?
                        <>
                            <Grid container>
                                <Grid item xs>
                                    <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.shortName}` : <br />}</Typography>
                                </Grid>
                            </Grid>
                            <Divider />
                        </>
                        :
                        <Grid container alignItems="center" spacing={2} pb={3}>
                            <Grid item>
                                <Typography variant="subtitle1" color={selectedTicker ? null : "error"}>Ticker Symbol</Typography>
                            </Grid>
                            <Grid item sm>
                                <TickerAutocomplete
                                    tickers={allTickers}
                                    onChange={onTickerSelectionChange}
                                    size={'small'}
                                    value={selectedTicker}
                                />
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle1">Expiration Date</Typography>
                            </Grid>
                            <Grid item sm={4.8}>
                                <FormControl fullWidth>
                                    <Select
                                        id="expiration-dates"
                                        value={selectedStrategy}
                                        fullWidth
                                        onChange={(e) => onStrategySelectionChange(e.target.value)}
                                        variant="standard"
                                        MenuProps={{
                                            style: {
                                                maxHeight: "400px",
                                            },
                                            anchorOrigin: {
                                                vertical: "bottom",
                                                horizontal: "center"
                                            },
                                            getContentAnchorEl: () => null,
                                        }}
                                    >
                                        {strategies.map(strat => <MenuItem value={strat}>{strat.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    }
                    <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                </Grid>
                <Grid p={4}>
                    {legs.map((leg, index) => {
                        switch (leg.type) {
                            case "option":
                                return (
                                    <BuildLeg leg={leg} index={index} key={index} selectedTicker={selectedTicker}
                                        atmPrice={basicInfo.regularMarketPrice} updateLeg={updateLeg}
                                        selectedStrategy={selectedStrategy} expirationTimestampsOptions={expirationTimestampsOptions}
                                    />
                                );
                            case "stock":
                                return (
                                    <BuildLeg leg={leg} index={index} key={index}
                                        selectedTicker={selectedTicker} updateLeg={updateLeg}
                                    />
                                );
                            case "cash":
                                return (
                                    <BuildLeg leg={leg} index={index} key={index}
                                        selectedTicker={selectedTicker} updateLeg={updateLeg}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </Grid>
                <Grid p={4}>
                    <Box component={Card} p={2}>
                        <Grid container alignItems="center">
                            <Grid item xs={2}>
                                <Typography variant="h5">
                                    {selectedStrategy.name}
                                </Typography>
                            </Grid>
                            <Alert severity="info">
                                Select the Expiration Date and Strike Price in order to view the strategy details
                            </Alert>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    );
}
