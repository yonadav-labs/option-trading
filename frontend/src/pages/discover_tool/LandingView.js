import React, { useEffect, useState } from "react";
import { Grid, Paper, Stack, Container, Divider, Typography, FormControl, Select, MenuItem, InputLabel, Box, useTheme } from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import TickerAutocomplete from "../../components/TickerAutocomplete";
import MetricLabel from '../../components/MetricLabel.js';
import { fixedFloat, GetGaEventTrackingFunc } from "../../utils";

const GaEvent = GetGaEventTrackingFunc('strategy screener');

export default function LandingView(props) {
    const {
        allTickers,
        selectedTicker,
        selectedExpirationTimestamp,
        onTickerSelectionChange,
        expirationTimestampsOptions,
        expirationDisabled,
        onExpirationSelectionChange,
        basicInfo,
        getBestTrades,
    } = props;
    const theme = useTheme();
    const useStyles = makeStyles({
        customPaper: {
            padding: theme.spacing(3),
            [theme.breakpoints.up('sm')]: {
                paddingLeft: theme.spacing(7),
                paddingRight: theme.spacing(7),
                margin: theme.spacing(1),
                borderRadius: 50
            }
        }
    }, theme);
    const classes = useStyles();
    const [sentiment, setSentiment] = useState(0);

    const handleSentimentChange = (sentiment) => {
        GaEvent('adjust sentiment');
        setSentiment(sentiment);
    };

    useEffect(() => {
        if (sentiment && selectedExpirationTimestamp) {
            getBestTrades({
                "target_price_lower": fixedFloat(basicInfo.latestPrice * sentiment),
                "target_price_upper": fixedFloat(basicInfo.latestPrice * sentiment),
            })
        }
    }, [sentiment, selectedExpirationTimestamp])

    return (
        <Container style={{ minHeight: "inherit", padding: 0 }}>
            <br />
            <Container>
                <Paper className={classes.customPaper} elevation={4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" variant="middle" flexItem />} spacing={2}>
                        <TickerAutocomplete
                            tickers={allTickers}
                            onChange={onTickerSelectionChange}
                            value={selectedTicker}
                            displayLabel
                        />

                        <FormControl disabled={expirationDisabled} fullWidth>
                            <InputLabel><Typography variant="h6">Option Expiration Date</Typography></InputLabel>
                            <Select
                                id="expiration-dates"
                                value={selectedExpirationTimestamp}
                                fullWidth
                                placeholder="Select an expiration date"
                                onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                            >
                                <MenuItem disabled value={"none"}><span style={{ color: "gray" }}>Select an expiration date</span></MenuItem>
                                {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl disabled={expirationDisabled} fullWidth>
                            <InputLabel><Typography variant="h6"><MetricLabel label='price target'></MetricLabel></Typography></InputLabel>
                            <Select
                                id="sentiment"
                                value={sentiment}
                                fullWidth
                                onChange={(e) => handleSentimentChange(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                            >
                                <MenuItem disabled value={0}>
                                    <span style={{ color: "gray" }}>
                                        Your price target
                                        {selectedTicker ? ' for ' + selectedTicker.symbol + ' ' : ' '}
                                        on exp date
                                    </span></MenuItem>
                                {[0.5, 0.2, 0.1, 0.05, 0, -0.05, -0.1, -0.2, -0.5].map((val, index) => {
                                    return (
                                        <MenuItem
                                            value={1 + val}>$
                                            {(basicInfo.latestPrice * (1 + val)).toFixed(2)} (
                                            {val > 0 ? '+' : ''}{(val * 100).toFixed(0)}%)
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                <Typography variant="h4" align="center">Discover option strategies with the best potential return.</Typography>
                <br />
                <Typography variant="body1" align="center">
                    Enter <b>what price</b> you think the stock will be and <b>by when</b>.
                    <br />
                    See the trades you can make and filter by return, chance or cost.
                </Typography>
            </Container>
            <br />
            <Grid container direction="row" justifyContent="space-evenly" alignItems="center" >
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="discover_step_1.png" alt="step 1" />
                        <Typography variant="button">Step 1</Typography>
                        <Typography variant="subtitle1">Select a stock by its ticker</Typography>
                        <Typography variant="body2">AAPL, AMZN, TSLA...</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="discover_step_2.png" alt="step 2" />
                        <Typography variant="button">Step 2</Typography>
                        <Typography variant="subtitle1">Select an expiration date</Typography>
                        <Typography variant="body2">Your timeframe for the strategy</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="discover_step_3.png" alt="step 3" />
                        <Typography variant="button">Step 3</Typography>
                        <Typography variant="subtitle1">Enter a price target</Typography>
                        <Typography variant="body2">Where do you think the price will be?</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="discover_step_4.png" alt="step 4" />
                        <Typography variant="button">Step 4</Typography>
                        <Typography variant="subtitle1">Discover the best strategies</Typography>
                        <Typography variant="body2">We calculate and show you the best one</Typography>
                    </Grid>
                </Box>
            </Grid>
        </Container>
    );
}
