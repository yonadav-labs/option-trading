import React from "react";
import {
    Grid, Typography, Divider, Chip, Card, CardHeader,
    CardContent, CardActions, IconButton
} from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { startCase } from 'lodash';

import TradeProfitLossGraph from "../TradeProfitLossGraph";
import MetricLabel from '../MetricLabel.js';
import {
    PriceFormatter, ProfitFormatter, PercentageFormatter,
    TimestampTimeFormatter, GetGaEventTrackingFunc,
    NumberRoundFormatter
} from '../../utils';
import ShareTradeBtn from "../ShareTradeBtn";
import BuildLegCard from "./BuildLegCard";
import OptionValueMatrix from "../OptionValueMatrix";

const GaEvent = GetGaEventTrackingFunc('trade details');

const useStyles = makeStyles(theme => ({
    capitalize: {
        textTransform: "capitalize"
    },
    tradeMeta: {
        flexGrow: 4
    }
}))

export default function NewTradeCard({ trade }) {
    const classes = useStyles();

    return (
        <Card>
            <CardHeader
                title=
                {
                    <Grid container direction="row" spacing={1}>
                        <Grid item>
                            <Typography variant="h5" className={classes.capitalize}
                                display="inline" paddingRight={2}>{startCase(trade.type)}</Typography>
                        </Grid>
                        <Grid item sm className={classes.tradeMeta}>
                            <Chip label={
                                <>
                                    <Typography variant="subtitle1" display="inline">
                                        <MetricLabel label={trade.net_debit_per_unit > 0 ? "Order Net Debit" : "order net credit"} />:
                                    </Typography>
                                    <Typography variant="body1" display="inline">{PriceFormatter(Math.abs(trade.net_debit_per_unit))}</Typography>
                                </>
                            } />
                        </Grid>
                        <Grid container item sm justifyContent="flex-end" spacing={1}>
                            <Grid item><ShareTradeBtn trade={trade} /></Grid>
                            <Grid item><IconButton><ZoomOutMapIcon /></IconButton></Grid>
                        </Grid>
                    </Grid>
                }
                style={{ paddingBottom: '0px' }}
            />
            <Divider variant="middle" />
            <CardContent style={{ paddingTop: "0px" }}>
                {trade.legs.map((leg, index) => (
                    <>
                        <Grid container direction="row" justifyContent="space-around" alignItems="baseline">
                            <Grid item sm><BuildLegCard leg={leg} hideTitle={true} index={index} key={index} /></Grid>
                        </Grid>
                        <Divider />
                    </>
                ))}
                <Grid container direction="row" justifyContent="space-between" paddingTop={2} spacing={1}>
                    <Grid item xs={12}>
                        <Typography variant="h6">Key Data</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="probability of profit" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{PercentageFormatter(trade.profit_prob)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="break-evens at" /></Typography>
                        {trade.break_even_prices_and_ratios.map(break_even => <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(break_even.ratio)} (at {PriceFormatter(break_even.price)})</Typography>)}
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="max profit" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{trade.best_return && trade.best_return != 'infinite' ?
                            <>{ProfitFormatter(trade.best_return / Math.abs(trade.cost))} ({PriceFormatter(trade.best_return)})</>
                            :
                            'UNLIMITED'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="max loss" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{trade.worst_return && trade.worst_return != 'infinite'
                            ? <>{ProfitFormatter(trade.worst_return / Math.abs(trade.cost))} ({PriceFormatter(trade.worst_return)})</>
                            : 'UNLIMITED'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="total cost" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">${trade.cost}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{PriceFormatter(trade.notional_value)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="leverage" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{PercentageFormatter(trade.leverage)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="total commission" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{PriceFormatter(trade.commission_cost)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="10% probability loss" /></Typography>
                        {
                            trade.ten_percent_worst_return_ratio != null ?
                                <>
                                    <Typography variant="body1" color="#4F4F4F">
                                        {ProfitFormatter(trade.ten_percent_worst_return_ratio)} ({PriceFormatter(trade.ten_percent_worst_return)})
                                    </Typography>
                                </>
                                :
                                <>
                                    <br />
                                    <Typography variant="body1" color="#4F4F4F"> N/A </Typography>
                                </>
                        }
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="10% probability profit" /></Typography>
                        {
                            trade.ten_percent_best_return_ratio != null ?
                                <>
                                    <Typography variant="body1" color="#4F4F4F">
                                        {ProfitFormatter(trade.ten_percent_best_return_ratio)} ({PriceFormatter(trade.ten_percent_best_return)})
                                    </Typography>
                                </>
                                :
                                <>
                                    <br />
                                    <Typography variant="body1" color="#4F4F4F"> N/A </Typography>
                                </>
                        }
                    </Grid>
                    <Grid item xs={6} sm={2}></Grid>
                    <Grid item xs={6} sm={2}></Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="delta" /></Typography>
                        <br />
                        <Typography variant="body1">{NumberRoundFormatter(trade.delta)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="gamma" /></Typography>
                        <br />
                        <Typography variant="body1">{NumberRoundFormatter(trade.gamma)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="theta" /></Typography>
                        <br />
                        <Typography variant="body1">{NumberRoundFormatter(trade.theta)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="vega" /></Typography>
                        <br />
                        <Typography variant="body1">{NumberRoundFormatter(trade.vega)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="rho" /></Typography>
                        <br />
                        <Typography variant="body1">{NumberRoundFormatter(trade.rho)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Typography variant="button"><MetricLabel label="quoted at" /></Typography>
                        <Typography variant="body1" color="#4F4F4F">{TimestampTimeFormatter(trade.quote_time)}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
            <>
                <Divider />
                <CardActions>
                    {/* trade profit graph */}
                    <Grid container>
                        <Grid item xs>
                            <TradeProfitLossGraph trade={trade} />
                        </Grid>
                    </Grid>
                </CardActions>
                <Divider />
                <CardActions>
                    <Grid container>
                        <Grid item xs>
                            <OptionValueMatrix matrixInfo={trade.return_matrix} stockPrice={trade.stock.stock_price} cost={trade.cost} />
                        </Grid>
                    </Grid>
                </CardActions>
            </>
        </Card>
    );
}
