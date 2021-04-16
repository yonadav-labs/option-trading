import React from "react";
import { Grid, Paper, TextField, Autocomplete, Stack, Container, Divider, makeStyles, Typography } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import VerticalCarousel from '../../components/VerticalCarousel';
import { Row, Col } from 'react-bootstrap';

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
            <Grid container justifyContent="center" alignItems="center" spacing={3}>
                <Grid item>
                    <h2>Discover option strategies with the best potential return</h2>
                </Grid>
                <Grid item xs={7}>
                    <Typography variant="body1" align="center">
                        Enter what you think the price of the stock will be and by when.
                        <br /> 
                        See the trades you can make to get the highest potential return. 
                    </Typography>
                </Grid>
            </Grid>
            <br />
            {/* TODO replace with material ui */}
            <Grid>
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
                            heading="Enter a target price"
                            text="Where do you think the stock price will be?"
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider4.png"
                            heading="Discover the best strategies"
                            text="We calculate thousands of permutations for each strategy and show you the best ones."
                        />
                    </VerticalCarousel>
                </Row>
            </Grid>
        </>
    );
}
