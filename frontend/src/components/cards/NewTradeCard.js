import React, { useState } from "react";
import {
    Grid, Typography, Divider, Chip, Card, CardHeader,
    CardContent, CardActionArea, CardActions, IconButton
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
import NewLegCard from "./NewLegCard";
import GraphSummary from "../GraphSummary";
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
    const [moreInfo, setMoreInfo] = useState(false)
    const [isRaised, setIsRaised] = useState(false)

    const showMoreInfo = () => {
        GaEvent('expand trade card');
        setMoreInfo(!moreInfo);
    };

    const mouseEnter = () => {
        setIsRaised(true)
    }

    const mouseExit = () => {
        setIsRaised(false)
    }

    return (
        <Card raised={isRaised} onMouseEnter={mouseEnter} onMouseLeave={mouseExit}>
            <CardActionArea onClick={showMoreInfo}>
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
                                &nbsp;
                                <Chip label={
                                    <Typography variant="subtitle1" display="inline">
                                        No.1 of {trade.meta.num_combinations} Possibilities
                                    </Typography>
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
                    {trade.legs.map((leg, idx) => (
                        <>
                            <Grid container direction="row" justifyContent="space-around" alignItems="baseline">
                                {/* <Grid item xs={12} sm={1}><Typography variant="h6">Leg {idx + 1}</Typography></Grid> */}
                                <Grid item sm><NewLegCard leg={leg} index={idx} showAction={moreInfo} /></Grid>
                            </Grid>
                            <Divider />
                        </>
                    ))}
                    <Grid container direction="row" justifyContent="space-between" paddingTop={2} spacing={1}>
                        {moreInfo ?
                            <Grid item xs={12}>
                                <Typography variant="h6">Key Data</Typography>
                            </Grid>
                            : null
                        }
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="potential return" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(trade.target_price_profit_ratio)} ({PriceFormatter(trade.target_price_profit)})</Typography>
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
                                <>{ProfitFormatter(trade.best_return / trade.cost)} ({PriceFormatter(trade.best_return)})</>
                                :
                                'UNLIMITED'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <Typography variant="button"><MetricLabel label="max loss" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{trade.worst_return && trade.worst_return != 'infinite'
                                ? <>{ProfitFormatter(trade.worst_return / trade.cost)} ({PriceFormatter(trade.worst_return)})</>
                                : 'UNLIMITED'}
                            </Typography>
                        </Grid>
                        {moreInfo ?
                            <>
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
                                    <Typography variant="button"><MetricLabel label="10% probability profit" /></Typography>
                                    {
                                        trade.ten_percent_best_return_ratio != null ?
                                            <Typography variant="body1" color="#4F4F4F">
                                                {ProfitFormatter(trade.ten_percent_best_return_ratio)} ({PriceFormatter(trade.ten_percent_best_return)})
                                            </Typography>
                                            : "N/A"
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Typography variant="button"><MetricLabel label="10% probability loss" /></Typography>
                                    {
                                        trade.ten_percent_worst_return_ratio != null ?
                                            <Typography variant="body1" color="#4F4F4F">
                                                {ProfitFormatter(trade.ten_percent_worst_return_ratio)} ({PriceFormatter(trade.ten_percent_worst_return)})
                                            </Typography>
                                            : "N/A"
                                    }
                                </Grid>
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
                            </>
                            :
                            null
                        }
                    </Grid>
                </CardContent>
                {!moreInfo ?
                    <div style={{
                        position: "relative",
                        width: "100%",
                        height: 100
                    }}>
                        <GraphSummary trade={trade} />
                    </div>
                    :
                    null
                }
            </CardActionArea>
            {/* show more info */}
            {moreInfo ?
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
                :
                null
            }
        </Card>
    );
}
