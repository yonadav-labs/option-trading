import React, { useState } from 'react';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter, TimestampTimeFormatter, GenerateTradeTitle, TimestampDateFormatter } from '../../utils';
import TradeProfitLossGraph from '../TradeProfitLossGraph.js';
import MetricLabel from '../MetricLabel.js';
import { startCase } from 'lodash';
import BuildLegCard from './BuildLegCard.js';
import { Card, CardHeader, CardContent, Grid, Typography } from '@material-ui/core';

export default function TradeDetailsCard(props) {
    const {
        pastTrade,
        trade,
        latestTrade,
        hideShareButton,
        hideDisclaimer,
        hideTitle,
        broker
    } = props;
    const displayCommissionCost = broker && broker.options_open_commission + broker.options_close_commission > 0.0;

    let profitLoss;
    if (latestTrade) {
        let profit = latestTrade.cost - pastTrade.cost;
        let profit_rate = profit / pastTrade.cost;
        let stock_profit_rate = latestTrade.stock.stock_price / pastTrade.stock.stock_price - 1;
        profitLoss = { profit, profit_rate, stock_profit_rate };
    }

    return (
        <Card sx={{ borderRadius: "10px" }}>
            {hideTitle ?
                null
                :
                <CardHeader title={GenerateTradeTitle(trade)} />
            }
            <CardContent>
                <Grid container direction="row">
                    <Grid item><Typography variant="h5" mb={4}>Overview</Typography></Grid>
                    {hideShareButton ? null : <div md={6}><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </Grid>
                <Grid container>
                    <Grid container direction="row" sx={{ mb: 3 }}>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="ticker" /></b><br />
                            {trade.stock.ticker.symbol}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="strategy" /></b><br />
                            {startCase(trade.type)}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label={trade.net_debit_per_unit > 0 ? "order net debit" : "order net credit"} /></b><br />
                            {PriceFormatter(Math.abs(trade.net_debit_per_unit))}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="quoted at" /></b><br />
                            {TimestampTimeFormatter(trade.quote_time)}
                        </Grid>
                    </Grid>
                    {
                        trade.legs.map((leg, index) => {
                            return (
                                <Grid container sx={{ borderTop: "1px solid #E4E4E4", borderBottom: "1px solid #E4E4E4" }} key={"leg_" + index + "_details"}>
                                    <BuildLegCard leg={leg} hideTitle={true} index={index} key={index} />
                                </Grid>
                            );
                        })
                    }
                    <Grid container direction="row" sx={{ mt: 3 }} >
                        <Grid item mb={4}><Typography variant="h5">Key Data</Typography></Grid>
                    </Grid>
                    <Grid container direction="row">
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="probability of profit" /></b><br />
                            {PercentageFormatter(trade.profit_prob)}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="break-even at" /></b><br />
                            {trade.break_even_prices_and_ratios.map((break_even, idx) => <span key={idx + break_even.price}>{ProfitFormatter(break_even.ratio)} (at {PriceFormatter(break_even.price)})<br /></span>)}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b> <MetricLabel label="max return" /></b><br />
                            {trade.best_return != null && trade.best_return != 'infinite' ?
                                (
                                    <span>
                                        {trade.reward_to_risk_ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(trade.reward_to_risk_ratio))} ({PriceFormatter(trade.best_return)})
                                    </span >
                                )
                                : (<span>Unlimited</span>)}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="10% probability loss" /></b><br />
                            {
                                trade.ten_percent_worst_return_ratio != null ?
                                    <>
                                        {ProfitFormatter(trade.ten_percent_worst_return_ratio)}
                                        ({PriceFormatter(trade.ten_percent_worst_return)})
                                        <br />
                                        {trade.ten_percent_worst_return_price > trade.stock.stock_price ? 'Above ' : 'Below '}
                                        {PriceFormatter(trade.ten_percent_worst_return_price)}
                                    </>
                                    : "N/A"
                            }
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="10% probability profit" /></b><br />
                            {
                                trade.ten_percent_best_return_ratio != null ?
                                    <>
                                        {ProfitFormatter(trade.ten_percent_best_return_ratio)}
                                        ({PriceFormatter(trade.ten_percent_best_return)})
                                        <br />
                                        {trade.ten_percent_best_return_price > trade.stock.stock_price ? 'Above ' : 'Below '}
                                        {PriceFormatter(trade.ten_percent_best_return_price)}
                                    </>
                                    : "N/A"
                            }
                        </Grid>
                    </Grid>
                    <Grid container >
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="total cost" /></b><br />
                            {PriceFormatter(trade.cost)}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="notional value" /></b><br />
                            {PriceFormatter(trade.notional_value)}
                        </Grid>
                        <Grid item sm={3} xs={6}>
                            <b><MetricLabel label="leverage" /></b><br />
                            {PercentageFormatter(trade.leverage)}
                        </Grid>
                        {displayCommissionCost &&
                            <Grid item sm={3} xs={6}>
                                <b> <MetricLabel label="total commission" /></b><br />
                                {PriceFormatter(trade.commission_cost)}
                            </Grid>
                        }
                        {trade &&
                            <Grid item sm={3} xs={6}>
                                <b><MetricLabel label="quoted at" /></b><br />
                                {TimestampTimeFormatter(trade.quote_time)}
                            </Grid>
                        }
                    </Grid>
                    <Grid container>
                        <TradeProfitLossGraph trade={trade} />
                    </Grid>
                </Grid>
            </CardContent>
        </Card >
    );
}