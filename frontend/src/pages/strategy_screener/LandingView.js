import React from "react";
import { Link } from "react-router-dom";
import { Paper, TextField, Autocomplete, Stack, Container, Divider, makeStyles, Typography, FormControl, Select, MenuItem, InputLabel } from "@material-ui/core";
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

                        <FormControl disabled={expirationDisabled} fullWidth>
                            <InputLabel><Typography variant="h6">Option Expiration Date</Typography></InputLabel>
                            <Select
                                id="expiration-dates"
                                value={selectedExpirationTimestamp}
                                fullWidth
                                placeholder="Select an expiration date"
                                onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                style={{paddingBottom: "5px"}}
                                variant="standard"
                            >
                                <MenuItem disabled value={"none"}><span style={{color: "gray"}}>Select an expiration date</span></MenuItem>
                                {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem> )}
                            </Select>
                        </FormControl>

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
                                    label={<Typography variant="h6">How are you feeling?</Typography>}
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
