import React, { useState } from "react";
import { Button, Popper, Box, makeStyles, Typography } from "@material-ui/core";
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
                        {basicInfo.regularMarketPrice
                            ? `$${basicInfo.regularMarketPrice}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="day range" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.regularMarketDayLow &&
                            basicInfo.regularMarketDayHigh
                            ? `${basicInfo.regularMarketDayLow.toFixed(
                                2
                            )} - ${basicInfo.regularMarketDayHigh.toFixed(2)}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="52 week range" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.fiftyTwoWeekLow && basicInfo.fiftyTwoWeekHigh
                            ? `${basicInfo.fiftyTwoWeekLow.toFixed(
                                2
                            )} - ${basicInfo.fiftyTwoWeekHigh.toFixed(2)}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="market cap" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.marketCap
                            ? `$${formatLargeNumber(basicInfo.marketCap, 1)}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="p/e ratio" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.trailingPE
                            ? basicInfo.trailingPE.toFixed(2)
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="eps" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.epsTrailingTwelveMonths
                            ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}`
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="earnings date" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.earningsTimestamp &&
                            basicInfo.earningsTimestamp > Date.now() / 1000
                            ? TimestampDateFormatter(basicInfo.earningsTimestamp)
                            : "N/A"}
                    </Typography>
                </div>
                <div style={{ flex: "0 0 auto", paddingRight: "0.3rem" }}>
                    <Typography variant="button" color="primary"><MetricLabel label="dividend date" /></Typography>
                    <br />
                    <Typography variant="body1">
                        {basicInfo.dividendDate &&
                            basicInfo.earningsTimestamp > Date.now() / 1000
                            ? TimestampDateFormatter(basicInfo.dividendDate)
                            : "N/A"}
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
                        >
                            <Box boxShadow={3} bgcolor="white" p={2} width='600px' height='400px'>
                                <TradingViewWidget symbol={basicInfo.symbol || ''} autosize />
                            </Box>
                        </Popper>
                    </>
                }
            </div>
            { isMobile ?
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
