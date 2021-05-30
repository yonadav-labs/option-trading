import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { PriceFormatter, PercentageFormatter, TimestampTimeFormatter, NumberRoundFormatter } from '../utils';
import MetricLabel from './MetricLabel.js';

export default function ScreenExpandedRow(props) {
    const { contract } = props;
    return (
        (
            contract ?
                <Grid container>
                    {/* row 1 */}
                    <Grid container justifyContent="space-between" py={1}>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="bid x size" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="ask x size" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="day's change" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="day range" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="itm probability" /></Typography>
                            <br />
                            <Typography variant="body2">{PercentageFormatter(contract.itm_probability)}</Typography>
                        </Grid>
                    </Grid>
                    {/* row 2 */}
                    <Grid container justifyContent="space-between" py={1}>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="vega" /></Typography>
                            <br />
                            <Typography variant="body2">{NumberRoundFormatter(contract.vega)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="rho" /></Typography>
                            <br />
                            <Typography variant="body2">{NumberRoundFormatter(contract.rho)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.notional_value)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="last traded" /></Typography>
                            <br />
                            <Typography variant="body2">{TimestampTimeFormatter(contract.last_trade_date)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="quoted at" /></Typography>
                            <br />
                            <Typography variant="body2">{TimestampTimeFormatter(contract.quote_time)}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                :
                null
        )
    );
}
