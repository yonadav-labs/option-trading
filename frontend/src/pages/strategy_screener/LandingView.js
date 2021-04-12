import React from "react";
import { Grid, Paper, TextField, Autocomplete, Stack, Container, Divider, makeStyles } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";

const useStyles = makeStyles((theme) => ({
    customPaper: {
        padding: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(7),
            paddingRight: theme.spacing(7),
            margin: theme.spacing(1),
            borderRadius: 50
        }
    }
}));

export default function LandingView(props) {
    const classes = useStyles();
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
            <br />
            <Container>
                <Paper className={classes.customPaper} elevation={4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" variant="middle" flexItem />} spacing={2}>
                        <TickerAutocomplete
                            tickers={allTickers}
                            onChange={onTickerSelectionChange}
                            value={selectedTicker}
                        />

                        <Autocomplete
                            id="expiration-dates"
                            value={selectedExpirationTimestamp}
                            options={expirationTimestampsOptions}
                            getOptionLabel={(option) => option.label}
                            fullWidth
                            disabled={expirationDisabled}
                            onChange={onExpirationSelectionChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    variant="standard"
                                    label="Option Expiration Date"
                                    placeholder="Select an expiration date"
                                />
                            )}
                        />

                        <Autocomplete
                            id="sentiment"
                            value={sentiment}
                            options={["Bullish", "Bearish"]}
                            fullWidth
                            disabled={expirationDisabled}
                            onChange={(e, val) => val ? onSentimentChange(val.toLowerCase()) : onSentimentChange('')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    variant="standard"
                                    label="How are you feeling?"
                                    placeholder="Select a sentiment"
                                />
                            )}
                        />
                    </Stack>
                </Paper>
            </Container>
            <br />
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
        </>
    );
}
