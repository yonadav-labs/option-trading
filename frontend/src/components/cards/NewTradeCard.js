import React, { useState } from "react";
import { Grid, makeStyles, Typography, Divider, Chip, Card, CardHeader, CardContent, CardActionArea, CardActions, IconButton } from "@material-ui/core";
import TradeProfitLossGraph from "../TradeProfitLossGraph";
import MetricLabel from '../MetricLabel.js';
import {
    PriceFormatter, ProfitFormatter, getTradeTypeDisplay, PercentageFormatter,
    TimestampTimeFormatter, GetGaEventTrackingFunc
} from '../../utils';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import ShareTradeBtn from "../ShareTradeBtn";
import NewLegCard from "./NewLegCard";
import GraphSummary from "../GraphSummary";

const GaEvent = GetGaEventTrackingFunc('trade details');

const useStyles = makeStyles(theme => ({
    capitalize: {
        textTransform: "capitalize"
    },
    tradeMeta:{
        flexGrow:4
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
                                    display="inline" paddingRight={2}>{getTradeTypeDisplay(trade.type)}</Typography>
                            </Grid>
                            <Grid item sm className={classes.tradeMeta}>
                                <Chip label={
                                    <>
                                        <Typography variant="subtitle1" display="inline">
                                            <MetricLabel label={trade.net_debt_per_unit > 0 ? "Order Net Debit" : "order net credit"} />:
                                        </Typography>
                                        <Typography variant="body1" display="inline">{PriceFormatter(Math.abs(trade.net_debt_per_unit))}</Typography>
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
                        <Grid item xs={6} sm={3}>
                            <Typography variant="button"><MetricLabel label="hypothetical return" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(trade.target_price_profit_ratio)} ({PriceFormatter(trade.target_price_profit)})</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="button"><MetricLabel label="probability of profit" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{PercentageFormatter(trade.profit_prob)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="button"><MetricLabel label="break-evens at" /></Typography>
                            {trade.break_even_prices_and_ratios.map(break_even => <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(break_even.ratio)} (at {PriceFormatter(break_even.price)})</Typography>)}
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="button"><MetricLabel label="max return" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{trade.best_return && trade.best_return != 'infinite' ?
                                <>{ProfitFormatter(trade.best_return / trade.cost)} ({PriceFormatter(trade.best_return)})</>
                                :
                                'UNLIMITED'}
                            </Typography>
                        </Grid>
                        {moreInfo ?
                            <>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="total cost" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">${trade.cost}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{PriceFormatter(trade.notional_value)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="leverage" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{PercentageFormatter(trade.leverage)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="total commission" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{PriceFormatter(trade.commission_cost)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="10% probability loss" /></Typography>
                                    {
                                        trade.two_sigma_profit_lower ?
                                            <>
                                                <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(trade.ten_percent_worst_return_ratio)} ({PriceFormatter(trade.ten_percent_worst_return)})</Typography>
                                                <Typography variant="body2" color="#828282">
                                                    {trade.ten_percent_worst_return_price > trade.stock.stock_price ? 'Above ' : 'Below '}
                                                    {PriceFormatter(trade.ten_percent_worst_return_price)}
                                                </Typography>
                                            </>
                                            : "N/A"
                                    }
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="10% probability profit" /></Typography>
                                    {
                                        trade.two_sigma_profit_lower ?
                                            <>
                                                <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(trade.ten_percent_best_return_ratio)} ({PriceFormatter(trade.ten_percent_best_return)})</Typography>
                                                <Typography variant="body2" color="#828282">
                                                    {trade.ten_percent_best_return_price > trade.stock.stock_price ? 'Above ' : 'Below '}
                                                    {PriceFormatter(trade.ten_percent_best_return_price)}
                                                </Typography>
                                            </>
                                            : "N/A"
                                    }
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="button"><MetricLabel label="quoted at" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{TimestampTimeFormatter(trade.quote_time)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}></Grid>
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
                </>
                :
                null
            }
        </Card>
    );
}
