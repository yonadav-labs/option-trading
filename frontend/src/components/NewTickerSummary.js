import React, {useState} from "react";
import { Grid, Button, Popper, Box, makeStyles} from "@material-ui/core";
import { TimestampDateFormatter, formatLargeNumber } from "../utils";
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import TradingViewWidget from 'react-tradingview-widget';
import MetricLabel from "./MetricLabel";

const useStyles = makeStyles(theme => ({
    viewChartButton: {
        color: '#ff8f2b',
        background: 'white',
        border: '1px solid #E4E4E4',
        '&:hover': {
            background: '#fafafa',
            boxShadow: 'none',
        }
    }
}))

export default function NewTickerSummary({ basicInfo }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;

    return (
        <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="last price" /></span>
                <span className="stock-summary-information">
                    {basicInfo.regularMarketPrice
                        ? `$${basicInfo.regularMarketPrice}`
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="day range" /></span>
                <span className="stock-summary-information">
                    {basicInfo.regularMarketDayLow &&
                    basicInfo.regularMarketDayHigh
                        ? `${basicInfo.regularMarketDayLow.toFixed(
                              2
                          )} - ${basicInfo.regularMarketDayHigh.toFixed(2)}`
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="52 week range" /></span>
                <span className="stock-summary-information">
                    {basicInfo.fiftyTwoWeekLow && basicInfo.fiftyTwoWeekHigh
                        ? `${basicInfo.fiftyTwoWeekLow.toFixed(
                              2
                          )} - ${basicInfo.fiftyTwoWeekHigh.toFixed(2)}`
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="market cap" /></span>
                <span className="stock-summary-information">
                    {basicInfo.marketCap
                        ? `$${formatLargeNumber(basicInfo.marketCap, 1)}`
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="p/e ratio" /></span>
                <span className="stock-summary-information">
                    {basicInfo.trailingPE
                        ? basicInfo.trailingPE.toFixed(2)
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="eps" /></span>
                <span className="stock-summary-information">
                    {basicInfo.epsTrailingTwelveMonths
                        ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}`
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="earnings date" /></span>
                <span className="stock-summary-information">
                    {basicInfo.earningsTimestamp &&
                    basicInfo.earningsTimestamp > Date.now() / 1000
                        ? TimestampDateFormatter(basicInfo.earningsTimestamp)
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <span className="stock-summary-title"><MetricLabel label="dividend date" /></span>
                <span className="stock-summary-information">
                    {basicInfo.dividendDate &&
                    basicInfo.earningsTimestamp > Date.now() / 1000
                        ? TimestampDateFormatter(basicInfo.dividendDate)
                        : "N/A"}
                </span>
            </Grid>
            <Grid item>
                <Button className={classes.viewChartButton} size="large" onClick={handleClick}>
                    <ZoomInIcon/>
                    <span className="stock-summary-title">View Chart</span>
                </Button>
            </Grid>
            <Popper 
                id={id} 
                open={open} 
                anchorEl={anchorEl} 
            >
                <Box boxShadow={3} bgcolor="white" p={2} width='600px' height='400px'>
                    <TradingViewWidget symbol={basicInfo.symbol || ''} autosize/>
                </Box>
            </Popper>
        </Grid>
    );
}
