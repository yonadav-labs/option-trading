import React, { useState, useContext } from "react";
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';
import {
    Grid, Typography, Divider, Chip, Card, CardHeader,
    CardContent, CardActionArea, CardActions, IconButton,
    Link
} from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { startCase } from 'lodash';

import TradeProfitLossGraph from "../TradeProfitLossGraph";
import MetricLabel from '../MetricLabel.js';
import getApiUrl, {
    PriceFormatter, ProfitFormatter, PercentageFormatter,
    GetGaEventTrackingFunc, NumberRoundFormatter,
    ConvertToTradeSnapshot
} from '../../utils';
import ShareTradeBtn from "../ShareTradeBtn";
import NewLegCard from "./NewLegCard";
import GraphSummary from "../GraphSummary";
import OptionValueMatrix from "../OptionValueMatrix";
import UserContext from '../../UserContext';

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
    const { authState } = useOktaAuth();
    const [detailedTrade, setDetailedTrade] = useState(null)
    const [moreInfo, setMoreInfo] = useState(false)
    const [isRaised, setIsRaised] = useState(false)
    const { user } = useContext(UserContext);
    const API_URL = getApiUrl();

    trade.graph_points = trade.graph_points_simple;

    const showMoreInfo = async () => {
        GaEvent('expand trade card');

        if (detailedTrade) {
            setMoreInfo(!moreInfo);
        } else {
            const tradeSnapshot = ConvertToTradeSnapshot(trade);
            try {
                let url = `${API_URL}/trade_snapshots_on_the_fly`;
                let headers = {
                    'Content-Type': 'application/json',
                }
                if (authState.isAuthenticated) {
                    const { accessToken } = authState;
                    headers['Authorization'] = `Bearer ${accessToken.accessToken}`
                }
                const response = await Axios.post(url, tradeSnapshot, {
                    headers: headers
                });
                setDetailedTrade(response.data.trade_snapshot);
                setMoreInfo(!moreInfo);
            } catch (error) {
                console.error(error);
            }
        }
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
                            {
                                user && user.subscription ?
                                    <Typography variant="body1" color="#4F4F4F">{PercentageFormatter(trade.profit_prob)}</Typography>
                                    :
                                    <Link href="/pricing" style={{ display: 'block' }}><LockOutlinedIcon /></Link>
                            }
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
                                        user && user.subscription ?
                                            trade.ten_percent_best_return_ratio != null ?
                                                <Typography variant="body1" color="#4F4F4F">
                                                    {ProfitFormatter(trade.ten_percent_best_return_ratio)} ({PriceFormatter(trade.ten_percent_best_return)})
                                                </Typography>
                                                : "N/A"
                                            :
                                            <Link href="/pricing" style={{ display: 'block' }}><LockOutlinedIcon /></Link>
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Typography variant="button"><MetricLabel label="10% probability loss" /></Typography>
                                    {
                                        user && user.subscription ?
                                            trade.ten_percent_worst_return_ratio != null ?
                                                <Typography variant="body1" color="#4F4F4F">
                                                    {ProfitFormatter(trade.ten_percent_worst_return_ratio)} ({PriceFormatter(trade.ten_percent_worst_return)})
                                                </Typography>
                                                : "N/A"
                                            :
                                            <Link href="/pricing" style={{ display: 'block' }}><LockOutlinedIcon /></Link>
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}></Grid>
                                <Grid item xs={6} sm={2}>
                                    <Typography variant="button"><MetricLabel label="delta" /></Typography>
                                    <br />
                                    {
                                        user && user.subscription ?
                                            <Typography variant="body1">{NumberRoundFormatter(trade.delta)}</Typography>
                                            :
                                            <Link href="/pricing" ><LockOutlinedIcon /></Link>
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Typography variant="button"><MetricLabel label="gamma" /></Typography>
                                    <br />
                                    {
                                        user && user.subscription ?
                                            <Typography variant="body1">{NumberRoundFormatter(trade.gamma)}</Typography>
                                            :
                                            <Link href="/pricing" ><LockOutlinedIcon /></Link>
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Typography variant="button"><MetricLabel label="theta" /></Typography>
                                    <br />
                                    {
                                        user && user.subscription ?
                                            <Typography variant="body1">{NumberRoundFormatter(trade.theta)}</Typography>
                                            :
                                            <Link href="/pricing" ><LockOutlinedIcon /></Link>
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Typography variant="button"><MetricLabel label="vega" /></Typography>
                                    <br />
                                    {
                                        user && user.subscription ?
                                            <Typography variant="body1">{NumberRoundFormatter(trade.vega)}</Typography>
                                            :
                                            <Link href="/pricing" ><LockOutlinedIcon /></Link>
                                    }
                                </Grid>
                                <Grid item xs={6} sm={2}></Grid>
                                <Grid item xs={6} sm={2}></Grid>
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
            {moreInfo && detailedTrade ?
                <>
                    <Divider />
                    <CardActions>
                        {/* trade profit graph */}
                        <Grid container>
                            <Grid item xs>
                                <TradeProfitLossGraph trade={detailedTrade} />
                            </Grid>
                        </Grid>
                    </CardActions>
                    <Divider />
                    <CardActions>
                        <Grid container>
                            <Grid item xs>
                                <OptionValueMatrix matrixInfo={detailedTrade.return_matrix} stockPrice={detailedTrade.stock.stock_price} cost={detailedTrade.cost} />
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
