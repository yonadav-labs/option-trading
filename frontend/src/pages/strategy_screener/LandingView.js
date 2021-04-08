import React from "react";
import { Grid, Paper, TextField, Box, Button } from "@material-ui/core";
import {
    Autocomplete,
    ToggleButtonGroup,
    ToggleButton,
} from "@material-ui/lab/";
import TickerAutocomplete from "../../components/TickerAutocomplete";

export default function LandingView(props) {
    const { 
        allTickers,
        selectedTicker,
        selectedExpirationTimestamp,
        onTickerSelectionChange,
        expirationTimestampsOptions,
        expirationDisabled,
        sentiment,
        onSentimentChange,
        onExpirationSelectionChange,
    } = props

    return (
        <>
        <Grid container direction="row" justifyContent="center" alignItems="center" >
                <Grid item>
                    <h1>Discover</h1>
                </Grid>
            </Grid>
            <br />
            <Grid container direction="row" justifyContent="center" alignItems="center" >
                <Grid item xs={7}>
                    <p style={{ textAlign: "center" }}>
                        {" "}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Quis auctor elit sed vulputate mi sit amet
                        mauris. Ligula ullamcorper malesuada proin libero nunc
                        consequat interdum.{" "}
                    </p>
                </Grid>
            </Grid>
            <br />
            <Grid container direction="row" justifyContent="center" alignItems="center" >
                <Grid item xs={5} align="center">
                    <Paper elevation={3}>
                        <Box p={4}>
                            <Grid container>
                                <Grid item style={{ paddingBottom: '0.5rem' }}>
                                    <span> Enter Ticker Symbol </span>
                                </Grid>
                            </Grid>
                            <Grid container>
                                <Grid item xs={12}>
                                    <TickerAutocomplete
                                        tickers={allTickers}
                                        onChange={onTickerSelectionChange}
                                        value={selectedTicker}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={3} >
                                <Grid item xs={6} alignItems="flex-start">
                                    <span>Option Expiration Date</span>
                                </Grid>
                                <Grid item xs={6} alignItems="flex-start">
                                    <span>How are you feeling?</span>
                                </Grid>
                            </Grid>
                            <Grid container direction="row" justifyContent="center" spacing={3} >
                                <Grid item xs={6}>
                                    <Autocomplete
                                        id="expiration-dates"
                                        value={selectedExpirationTimestamp}
                                        options={expirationTimestampsOptions}
                                        getOptionLabel={(option) =>
                                            option.label
                                        }
                                        fullWidth
                                        disabled={expirationDisabled}
                                        onChange={onExpirationSelectionChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Select an expiration date"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <ToggleButtonGroup
                                        value={sentiment}
                                        exclusive
                                        onChange={(e, newVal) => onSentimentChange(newVal)}
                                        size="large"
                                    >
                                        <ToggleButton value="bullish" disabled={expirationDisabled}>
                                            Bullish
                                        </ToggleButton>
                                        <ToggleButton value="bearish" disabled={expirationDisabled}>
                                            Bearish
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}
