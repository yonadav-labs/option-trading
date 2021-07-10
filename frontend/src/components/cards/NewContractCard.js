import React from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import MetricLabel from '../MetricLabel';
import { NumberRoundFormatter, PercentageFormatter, PriceFormatter, TimestampTimeFormatter } from '../../utils';

export default function NewContractCard(props) {
    const { contract } = props;

    if (contract) {
        return (
            <Card sx={props.sx}>
                <CardContent>
                    <Grid container spacing={1}>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="mid/mark" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.mark)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="bid x size" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="ask x size" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="day's change" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="day range" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="implied volatility" /></Typography>
                            <Typography variant="body1">{PercentageFormatter(contract.implied_volatility)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="last traded" /></Typography>
                            <Typography variant="body1">{TimestampTimeFormatter(contract.last_trade_date)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="to expiration" /></Typography>
                            <Typography variant="body1">{contract.days_till_expiration} days</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.notional_value)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="break-even at" /></Typography>
                            <Typography variant="body1">{PriceFormatter(contract.break_even_price)}</Typography>
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="intrinsic value" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.intrinsic_value)}</Typography>
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="extrinsic value" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.extrinsic_value)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="delta" /></Typography>
                            <Typography variant="body1">{NumberRoundFormatter(contract.delta)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="gamma" /></Typography>
                            <Typography variant="body1">{NumberRoundFormatter(contract.gamma)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="theta" /></Typography>
                            <Typography variant="body1">{NumberRoundFormatter(contract.theta)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="vega" /></Typography>
                            <Typography variant="body1">{NumberRoundFormatter(contract.vega)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="rho" /></Typography>
                            <Typography variant="body1">{NumberRoundFormatter(contract.rho)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="quoted at" /></Typography>
                            <Typography variant="body1">{TimestampTimeFormatter(contract.quote_time)}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    } else {
        return null;
    }
}