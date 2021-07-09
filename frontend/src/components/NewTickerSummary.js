import React, { useState } from "react";
import { Button, Popper, Box, Typography } from "@material-ui/core";
import { TimestampDateFormatter, formatLargeNumber, PercentageFormatter } from "../utils";
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import TradingViewWidget from 'react-tradingview-widget';
import MetricLabel from "./MetricLabel";
import { makeStyles } from '@material-ui/styles';
import Moment from 'react-moment';

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

export default function NewTickerSummary({ basicInfo, isMobile }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;

    return (
        <>
            <div
                style={{
                    display: "inherit",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    width: "100%",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="last price" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.latestPrice ? `$${basicInfo.latestPrice}` : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="day range" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.low && basicInfo.high
                            ? `${basicInfo.low.toFixed(2)} - ${basicInfo.high.toFixed(2)}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="52 week range" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.week52Low && basicInfo.week52High
                            ? `${basicInfo.week52Low.toFixed(2)} - ${basicInfo.week52High.toFixed(2)}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="market cap" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.marketCap ? `$${formatLargeNumber(basicInfo.marketCap, 1)}` : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="p/e ratio" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.tickerStats && basicInfo.tickerStats.pe_ratio ?
                            basicInfo.tickerStats.pe_ratio.toFixed(2) : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="eps" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.tickerStats && basicInfo.tickerStats.ttm_eps ?
                            `$${basicInfo.tickerStats.ttm_eps.toFixed(2)}` : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="earnings date" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.tickerStats && basicInfo.tickerStats.next_earnings_date ?
                            <Moment date={Date.parse(basicInfo.tickerStats.next_earnings_date)} format="MMM Do, YYYY" /> : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="dividend date" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.tickerStats && basicInfo.tickerStats.next_dividend_date ?
                            basicInfo.tickerStats.next_dividend_date : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="historical volatility" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.tickerStats && basicInfo.tickerStats.historical_volatility ?
                            PercentageFormatter(basicInfo.tickerStats.historical_volatility) : "N/A"}
                    </Typography>
                </div>
                {isMobile ?
                    null
                    :
                    <>
                        <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                            <Button className={classes.viewChartButton} size="large" onClick={handleClick}>
                                <ZoomInIcon />
                                <Typography variant="button" color="primary">View Chart</Typography>
                            </Button>
                        </div>
                        <Popper
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            style={{ zIndex: 100 }}
                        >
                            <Box boxShadow={3} bgcolor="white" p={2} width='600px' height='400px'>
                                <TradingViewWidget symbol={basicInfo.symbol || ''} autosize />
                            </Box>
                        </Popper>
                    </>
                }
            </div>
            {isMobile ?
                <div style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center"
                }}
                >
                    <Button className={classes.viewChartButton} size="large" onClick={handleClick}>
                        <ZoomInIcon />
                        <Typography variant="button" color="primary">View Chart</Typography>
                    </Button>
                    <Popper
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                    >
                        <Box boxShadow={3} bgcolor="white" p={2} width='600px' height='400px'>
                            <TradingViewWidget symbol={basicInfo.symbol || ''} autosize />
                        </Box>
                    </Popper>
                </div>
                :
                null
            }
        </>
    );
}
