import React from 'react';
import { TimestampDateFormatter, formatLargeNumber } from '../utils';
import MetricLabel from './MetricLabel.js';
import { Grid } from '@material-ui/core';

export default function TickerSummary({ basicInfo, from }) {
    return (
        <Grid>
            <Grid container item direction="row" md={from === 'option' ? 2 : 12} mb={2}>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="last price" /></b><br />
                    {basicInfo.latestPrice ? `$${basicInfo.latestPrice}` : "N/A"}
                </Grid>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="day range" /></b><br />
                    {basicInfo.low && basicInfo.high ?
                        `${basicInfo.low.toFixed(2)}-${basicInfo.high.toFixed(2)}` : "N/A"}

                </Grid>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="52 week range" /></b><br />
                    {basicInfo.week52Low && basicInfo.week52High ?
                        `${basicInfo.week52Low.toFixed(2)}-${basicInfo.week52High.toFixed(2)}` : "N/A"}
                </Grid>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="market cap" /></b><br />
                    {basicInfo.marketCap ? `$${formatLargeNumber(basicInfo.marketCap, 1)}` : "N/A"}
                </Grid>
            </Grid>
            <Grid container item direction="row" md={from === 'option' ? 2 : 12}>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="p/e ratio" /></b><br />
                    {basicInfo.peRatio ? basicInfo.peRatio.toFixed(2) : "N/A"}
                </Grid>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="eps" /></b><br />
                    {basicInfo.epsTrailingTwelveMonths ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}` : "N/A"}
                </Grid>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="earnings date" /></b><br />
                    {basicInfo.earningsTimestamp && basicInfo.earningsTimestamp > Date.now() / 1000 ?
                        TimestampDateFormatter(basicInfo.earningsTimestamp) : "N/A"}
                </Grid>
                <Grid item sm={3} xs={6}>
                    <b><MetricLabel label="dividend date" /></b><br />
                    {basicInfo.dividendDate && basicInfo.earningsTimestamp > Date.now() / 1000 ?
                        TimestampDateFormatter(basicInfo.dividendDate) : "N/A"}
                </Grid>
            </Grid>
        </Grid>
    );
}