import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import {
    PriceFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter
} from '../utils';
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
                            <Typography variant="button"><MetricLabel label="last" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.last_price)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="mid/mark" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.mark)}</Typography>
                        </Grid>
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
                            <Typography variant="button"><MetricLabel label="volume" /></Typography>
                            <br />
                            <Typography variant="body2">{contract.volume}</Typography>
                        </Grid>
                    </Grid>
                    {/* row 2 */}
                    <Grid container justifyContent="space-between" py={1}>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="open interest" /></Typography>
                            <br />
                            <Typography variant="body2">{contract.open_interest}</Typography>
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
                            <Typography variant="button"><MetricLabel label="implied volatility" /></Typography>
                            <br />
                            <Typography variant="body2">{PercentageFormatter(contract.implied_volatility)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="itm probability" /></Typography>
                            <br />
                            <Typography variant="body2">{PercentageFormatter(contract.itm_probability)}</Typography>
                        </Grid>
                    </Grid>
                    {/* row 3 */}
                    <Grid container justifyContent="space-between" py={1}>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="delta" /></Typography>
                            <br />
                            <Typography variant="body2">{NumberRoundFormatter(contract.delta)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="theta" /></Typography>
                            <br />
                            <Typography variant="body2">{NumberRoundFormatter(contract.theta)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="gamma" /></Typography>
                            <br />
                            <Typography variant="body2">{NumberRoundFormatter(contract.gamma)}</Typography>
                        </Grid>
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
                    </Grid>
                    {/* row 4 */}
                    <Grid container justifyContent="space-between" py={1}>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="to expiration" /></Typography>
                            <br />
                            <Typography variant="body2">{contract.days_till_expiration} days</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.notional_value)}</Typography>
                        </Grid>
                        <Grid item sm="2.4" xs="6">
                            <Typography variant="button"><MetricLabel label="break-even at" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.break_even_price)}</Typography>
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

