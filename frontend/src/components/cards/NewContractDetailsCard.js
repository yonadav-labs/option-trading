import React from 'react';
import { Grid } from '@material-ui/core';

import {
    PriceFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter
} from '../../utils';
import MetricLabel from '../MetricLabel.js';

export default function NewContractDetailsCard(props) {
    const { contract } = props;
    return (
        (
            contract ?
                <Grid container>
                    <Grid container>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="last" /><br />
                            {PriceFormatter(contract.last_price)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="mid/mark" /><br />
                            {PriceFormatter(contract.mark)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="bid x size" /><br />
                            {PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="ask x size" /><br />
                            {PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="volume" /><br />
                            {contract.volume}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="open interest" /><br />
                            {contract.open_interest}
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="day's change" /><br />
                            {PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="day range" /><br />
                            {PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}
                        </Grid>

                        <Grid sm="2" xs="12">
                            <MetricLabel label="last traded" /><br />
                            {TimestampTimeFormatter(contract.last_trade_date)}
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="implied volatility" /><br />
                            {PercentageFormatter(contract.implied_volatility)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="delta" /><br />
                            {NumberRoundFormatter(contract.delta)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="theta" /><br />
                            {NumberRoundFormatter(contract.theta)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="gamma" /><br />
                            {NumberRoundFormatter(contract.gamma)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="vega" /><br />
                            {NumberRoundFormatter(contract.vega)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="rho" /><br />
                            {NumberRoundFormatter(contract.rho)}
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="itm probability" /><br />
                            {PercentageFormatter(contract.itm_probability)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="to expiration" /><br />
                            {contract.days_till_expiration} days
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="notional value" /><br />
                            {PriceFormatter(contract.notional_value)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="break-even at" /><br />
                            {PriceFormatter(contract.break_even_price)}
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <MetricLabel label="quoted at" /><br />
                            {TimestampTimeFormatter(contract.quote_time)}
                        </Grid>
                    </Grid>
                </Grid>
                :
                null
        )
    );
}

