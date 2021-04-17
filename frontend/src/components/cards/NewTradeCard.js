import React, { useState } from "react";
import { Grid, makeStyles, Typography, Divider, Chip, Card, CardHeader, CardContent, CardActionArea, CardActions, IconButton, Fab } from "@material-ui/core";
import TradeProfitLossGraph from "../TradeProfitLossGraph";
import MetricLabel from '../MetricLabel.js';
import {
    PriceFormatter, ProfitFormatter, getTradeTypeDisplay, PercentageFormatter,
    TimestampDateFormatter, TimestampTimeFormatter
} from '../../utils';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ShareTradeBtn from "../ShareTradeBtn";

const useStyles = makeStyles(theme => ({
    viewMoreButton: {
        border: "1px solid #E4E4E4",
        borderRadius: "22px",
        background: "#FFFFFF",
        "&:focus": {
            outline: "none"
        },
        "& .MuiButton-label": {
            font: "500 14px Roboto",
            color: "#FF902B",
        },
        "&:hover": {
            background: '#fafafa'
        }
    },
    horizontalLine: {
        borderBottom: "1px solid #E4E4E4",
        flex: '1 1 auto'
    },
    capitalize: {
        textTransform: "capitalize"
    }
}))

export default function NewTradeCard({ trade }) {
    const [moreInfo, setMoreInfo] = useState(false)

    const showMoreInfo = () => {
        setMoreInfo(!moreInfo);
    };
    const classes = useStyles();

    return (
        <Card>
            <CardActionArea onClick={showMoreInfo}>
                <CardHeader
                    title={<Grid container direction="row" spacing={1}>
                        <Grid item>
                            <Typography variant="h5" className={classes.capitalize} display="inline" paddingRight={2}>{getTradeTypeDisplay(trade.type)}</Typography>
                        </Grid>
                        <Grid item sm>
                            <Chip label={
                                <>
                                    <Typography variant="subtitle1" display="inline"><MetricLabel label={trade.net_debt_per_unit > 0 ? "Order Net Debt" : "order net credit"} />:</Typography>
                                    <Typography variant="body1" display="inline">{PriceFormatter(Math.abs(trade.net_debt_per_unit))}</Typography>
                                </>
                            } />
                        </Grid>
                        <Grid container item sm justifyContent="flex-end" spacing={1}>
                            <Grid item><ShareTradeBtn trade={trade} /></Grid>
                            <Grid item><IconButton><ZoomOutMapIcon /></IconButton></Grid>
                        </Grid>
                    </Grid>}
                />
                <Divider variant="middle" />
                <CardContent>
                    {trade.legs.map((leg, idx) => (
                        <>
                            {/* <LegDetailsCard key={index} leg={leg} leg_num={index + 1}></LegDetailsCard> */}
                            <Grid container direction="row" justifyContent="space-around" alignItems="baseline" spacing={2} paddingY={1}>
                                <Grid item xs={12} sm={1}><Typography variant="h6">Leg {idx + 1}</Typography></Grid>
                                <Grid item xs={6} sm={1}>
                                    <Typography variant="button"><MetricLabel label="action" /></Typography>
                                    <Typography variant="body1">{leg.is_long ? 'Long' : 'Short'}</Typography>
                                </Grid>
                                <Grid item xs={6} sm>
                                    <Typography variant="button"><MetricLabel label="quantity" /></Typography>
                                    <Typography variant="body1">{leg.units} {leg.stock ? "Shares" : ""}</Typography>
                                    <Typography variant="body1">{leg.stock ? <>{PriceFormatter(leg.stock.stock_price)} per Share</> : ""}</Typography>
                                </Grid>
                                {
                                    leg.contract &&
                                    <>
                                        <Grid item xs={6} sm>
                                            <Typography variant="button"><MetricLabel label="exp date" /></Typography>
                                            <Typography variant="body1">{TimestampDateFormatter(leg.contract.expiration)}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm>
                                            <Typography variant="button"><MetricLabel label="strike" /></Typography>
                                            <Typography variant="body1">{PriceFormatter(leg.contract.strike)}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm>
                                            <Typography variant="button"><MetricLabel label="call / put" /></Typography>
                                            <Typography variant="body1">{leg.contract.is_call ? 'Call' : 'Put'}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm>
                                            <Typography variant="button"><MetricLabel label="last" /></Typography>
                                            <Typography variant="body1">{PriceFormatter(leg.contract.last_price)}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm>
                                            <Typography variant="button"><MetricLabel label="volume" /></Typography>
                                            <Typography variant="body1">{leg.contract.volume}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm>
                                            <Typography variant="button"><MetricLabel label="open interest" /></Typography>
                                            <Typography variant="body1">{leg.contract.open_interest}</Typography>
                                        </Grid>
                                    </>
                                }
                                {moreInfo ?
                                    <IconButton onClick={(e) => { console.log("leg expand clicked"); e.stopPropagation() }}><ExpandMoreIcon /></IconButton>
                                    : null}

                            </Grid>
                            <Divider />
                        </>
                    ))}
                    <Grid container direction="row" justifyContent="space-between" paddingTop={4} spacing={1}>
                        {moreInfo ?
                            <Grid item xs={12}>
                                <Typography variant="h6">Key Data</Typography>
                            </Grid>
                            : null
                        }
                        <Grid item xs={6} sm={2.4}>
                            <Typography variant="button"><MetricLabel label="hypothetical return" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(trade.target_price_profit_ratio)} ({PriceFormatter(trade.target_price_profit)})</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Typography variant="button"><MetricLabel label="break-even at" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{ProfitFormatter(trade.to_break_even_ratio)} (at {PriceFormatter(trade.break_even_price)})</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Typography variant="button"><MetricLabel label="max return" /></Typography>
                            <Typography variant="body1" color="#4F4F4F">{trade.profit_cap ?
                                <>{ProfitFormatter(trade.profit_cap / trade.cost)} ({PriceFormatter(trade.profit_cap)})</>
                                :
                                'UNLIMITED'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.4}>
                            <Typography variant="button"><MetricLabel label="10% chance loss" /></Typography>
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
                        <Grid item xs={6} sm={2.4}>
                            <Typography variant="button"><MetricLabel label="10% chance profit" /></Typography>
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
                        {moreInfo ?
                            <>
                                <Grid item xs={6} sm>
                                    <Typography variant="button"><MetricLabel label="total cost" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">${trade.cost}</Typography>
                                </Grid>
                                <Grid item xs={6} sm>
                                    <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{PriceFormatter(trade.notional_value)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm>
                                    <Typography variant="button"><MetricLabel label="leverage" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{PercentageFormatter(trade.leverage)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm>
                                    <Typography variant="button"><MetricLabel label="total commission" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{PriceFormatter(trade.commission_cost)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm>
                                    <Typography variant="button"><MetricLabel label="quoted at" /></Typography>
                                    <Typography variant="body1" color="#4F4F4F">{TimestampTimeFormatter(trade.quote_time)}</Typography>
                                </Grid>
                            </>
                            :
                            null
                        }
                    </Grid>

                </CardContent>

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
                        {/* leg details */}
                        {/* <Box p={2} bgcolor="#f5f6f6">
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                            >
                                {
                                    trade.legs.map((leg, index) => {
                                        return (
                                            <Grid item key={index} xs={12}>
                                                <LegDetailsCard key={index} leg={leg} leg_num={index + 1}></LegDetailsCard>
                                                {index < trade.legs.length - 1 ? <br /> : null}
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        </Box> */}
                    </CardActions>
                </>
                :
                null
            }
        </Card>
    );
}
