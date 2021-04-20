import React from "react";
import { Link } from "react-router-dom";
import { Paper, TextField, Alert, Autocomplete, Stack, Container, Divider, makeStyles, Typography, Box } from "@material-ui/core";
import { useOktaAuth } from '@okta/okta-react';
import TickerAutocomplete from "../../components/TickerAutocomplete";
import VerticalCarousel from '../../components/VerticalCarousel';
import { Row } from 'react-bootstrap';

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
    const { authState } = useOktaAuth();
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
                            displayLabel
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
                            options={["Neutral (0%)", "Bullish (+5%)", "Bearish (-5%)", "Very Bullish (+10%)", "Very Bearish (-10%)"]}
                            fullWidth
                            disabled={expirationDisabled}
                            onChange={(e, val) => onSentimentChange(val)}
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
            <Container>
                {!authState.isAuthenticated &&
                    (
                        <Typography variant="body1" align="center" pb={5}>
                            <a href="/signin"><b>LOG IN</b></a> or <Link to="/signin/register"><b>
                                SIGN UP FOR FREE</b></Link> to unlock Cash Secured Put and 3 more Vertical Spread strategies!
                        </Typography>
                    )}
                <Typography variant="h4" align="center">Discover option strategies with the best potential return.</Typography>
                <br />
                <Typography variant="body1" align="center">
                    Enter what you think the price of the stock will be and by when.
                        <br />
                        See the trades you can make to get the highest potential return.
                    </Typography>
            </Container>
            <br />
            {/* TODO replace with material ui */}
            <Container>
                <Row className="p-5">
                    <VerticalCarousel>
                        <VerticalCarousel.Slide
                            imgSrc="slider1.png"
                            heading="Select a stock"
                            text="AAPL, AMZN, TSLA..."
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider2.png"
                            heading="Select an expiration date"
                            text="Your timeframe for the strategy."
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider3.png"
                            heading="Enter a price target"
                            text="Where do you think the stock price will be?"
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider4.png"
                            heading="Discover the best strategies"
                            text="We calculate thousands of permutations for each strategy and show you the best ones."
                        />
                    </VerticalCarousel>
                </Row>
            </Container>
        </>
    );
}
