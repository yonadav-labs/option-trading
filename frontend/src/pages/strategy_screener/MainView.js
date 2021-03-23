import React, { useState, useEffect } from "react";
import { Grid, Button, TextField, Box } from "@material-ui/core";
import { Autocomplete, Pagination } from "@material-ui/lab/";
import { TimestampDateFormatter, formatLargeNumber } from '../../utils';
import NewTradeCard from "../../components/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterContainer from "../../components/filters/FilterContainer";
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import MetricLabel from '../../components/MetricLabel.js';


export default function MainView({ allTickers, onTickerSelectionChange, bestStrategies, basicInfo }) {
    const [renderedStrategies, setRenderedStrategies] = useState([])
    const [noOfPages, setNoOfPages] = useState(null)

    const pageChangeHandler = (event, page) => {
        setRenderedStrategies(bestStrategies.slice((10 * (page - 1)), (10 * page)))
    }

    useEffect(() => {
        setRenderedStrategies(bestStrategies.slice(0, 10))
        setNoOfPages(Math.ceil(bestStrategies.length / 10))
    }, [bestStrategies])

    return (
        <div>
            <Grid container direction="row" justify="center" alignItems="stretch">
                <Grid item sm={2}>
                    <Box p={4} bgcolor='#333741' color="white" height="105%" style={{ marginRight: '-2rem' }}>
                        <Grid container direction="column" justify="center" className="filter-label">
                            <FilterContainer />
                        </Grid>
                    </Box>
                </Grid>
                <Grid item sm={10}>
                    <Box boxShadow={4} p={2} style={{ marginLeft: '2rem' }}>
                        <Box py={2}>
                            <Grid container direction="row" justify="center" alignItems="center">
                                <Grid item sm={2}>
                                    <span className="main-selection">ENTER TICKER SYMBOL</span>
                                </Grid>
                                <Grid item sm={6}>
                                    <TickerAutocomplete
                                        tickers={allTickers}
                                        onChange={onTickerSelectionChange}
                                        size={'small'}
                                    />
                                </Grid>
                                <Grid item sm={2} style={{ paddingLeft: '1rem' }}>
                                    <span className="main-selection">EXPIRATION DATE</span>
                                </Grid>
                                <Grid item sm={2}>
                                    <Autocomplete
                                        id="expiration-dates"
                                        multiple
                                        options={options}
                                        size="small"
                                        fullWidth
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Select an expiration date"
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box py={3}>
                            <Grid container direction="row" justify="space-between" alignItems="center">
                                <Grid item>
                                    <MetricLabel label='last price' />
                                    <span className="stock-summary-information">
                                        {basicInfo.regularMarketPrice ? `$${basicInfo.regularMarketPrice}` : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='day range' />
                                    <span className="stock-summary-information">
                                        {basicInfo.regularMarketDayLow && basicInfo.regularMarketDayHigh ?
                                            `${basicInfo.regularMarketDayLow.toFixed(2)} - ${basicInfo.regularMarketDayHigh.toFixed(2)}` : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='52 week range' />
                                    <span className="stock-summary-information">
                                        {basicInfo.fiftyTwoWeekLow && basicInfo.fiftyTwoWeekHigh ?
                                            `${basicInfo.fiftyTwoWeekLow.toFixed(2)} - ${basicInfo.fiftyTwoWeekHigh.toFixed(2)}` : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='market cap' />
                                    <span className="stock-summary-information">
                                        {basicInfo.marketCap ? `$${formatLargeNumber(basicInfo.marketCap, 1)}` : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='p/e ratio' />
                                    <span className="stock-summary-information">
                                        {basicInfo.trailingPE ? basicInfo.trailingPE.toFixed(2) : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='eps' />
                                    <span className="stock-summary-information">
                                        {basicInfo.epsTrailingTwelveMonths ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}` : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='earning date' />
                                    <span className="stock-summary-information">
                                        {basicInfo.earningsTimestamp && basicInfo.earningsTimestamp > Date.now() / 1000 ? TimestampDateFormatter(basicInfo.earningsTimestamp) : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <MetricLabel label='dividend date' />
                                    <span className="stock-summary-information">
                                        {basicInfo.dividendDate && basicInfo.earningsTimestamp > Date.now() / 1000 ? TimestampDateFormatter(basicInfo.dividendDate) : "N/A"}
                                    </span>
                                </Grid>
                                <Grid item>
                                    <Button size="large" variant="outlined">
                                        <ZoomInIcon style={{ color: "#FF8F2B" }} />
                                        <span className='stock-summary-title'>View Chart</span>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Box p={5} bgcolor='#F2F2F2' minHeight="100vh" height="100%" style={{ marginLeft: '2rem' }}>
                        <Grid container spacing={2} direction="column" justify="center" alignItems="stretch">
                            {renderedStrategies.map((strategy, index) => <NewTradeCard strategy={strategy} key={index} />)}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            <Grid container justify="flex-end">
                <Pagination count={noOfPages} color="primary" onChange={pageChangeHandler} />
            </Grid>
        </div>
    );
}

const options = [
    'hello',
    'world',
    'apple',
    'tesla'
]