import React from "react";
import { Paper, Stack, Container, Divider, makeStyles, Typography, FormControl, Select, MenuItem, InputLabel } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import VerticalCarousel from '../../components/VerticalCarousel';
import { Row } from 'react-bootstrap';
import MetricLabel from '../../components/MetricLabel.js';

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
                                onChange={(e) => onSentimentChange(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                            >
                                <MenuItem disabled value={0}><span style={{ color: "gray" }}>Select a Price Target</span></MenuItem>
                                <MenuItem value={1.2}>+20%</MenuItem>
                                <MenuItem value={1.1}>+10%</MenuItem>
                                <MenuItem value={1.05}>+5%</MenuItem>
                                <MenuItem value={1}>0%</MenuItem>
                                <MenuItem value={0.95}>-5%</MenuItem>
                                <MenuItem value={0.9}>-10%</MenuItem>
                                <MenuItem value={0.8}>-20%</MenuItem>
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
                    Enter <b>what price</b> you think the stock will be and by <b>when</b>.
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
