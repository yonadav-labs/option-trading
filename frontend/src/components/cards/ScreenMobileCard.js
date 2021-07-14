import React, { useState } from "react";
import { makeStyles } from '@material-ui/styles';
import { Grid, Box, Typography } from "@material-ui/core";
import MetricLabel from '../MetricLabel.js';
import {
    PriceFormatter, NumberRoundFormatter, PercentageFormatter,
    TimestampDateFormatter, TimestampTimeFormatter, GetGaEventTrackingFunc
} from '../../utils';

const GaEvent = GetGaEventTrackingFunc('trade details');

const useStyles = makeStyles({
    box: {
        border: 1,
        borderColor: "black"
    },
});

export default function ScreenMobileCard({ trade }) {
    const classes = useStyles();
    const [moreInfo, setMoreInfo] = useState(false)

    const showMoreInfo = () => {
        GaEvent('expand trade card');
        setMoreInfo(!moreInfo);
    };

    return (
        <>
            <Box border={0.5} borderColor="rgba(228, 228, 228, 1)" px={2} py={3} bgcolor={trade.in_the_money ? "rgba(242, 246, 255, 1)" : null} onClick={showMoreInfo}>
                <Grid container justifyContent="space-between">
                    <Typography variant="h5"> {PriceFormatter(trade.strike)} {TimestampDateFormatter(trade.expiration)} {trade.is_call ? "Call" : "Put"}</Typography>
                    <Typography variant="body1"> {PriceFormatter(trade.mark)} </Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Grid item>
                        <Typography variant="button"> BREAKEVEN </Typography>
                        <br />
                        <Typography variant="body1"> At {PriceFormatter(trade.break_even_price)} </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="button"> VOL </Typography>
                        <br />
                        <Typography variant="body1"> {trade.volume} </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="button"> OPEN INTEREST </Typography>
                        <br />
                        <Typography variant="body1"> {trade.open_interest} </Typography>
                    </Grid>
                </Grid>
            </Box>
            {moreInfo ?
                <Box border={0.5} borderColor="rgba(228, 228, 228, 1)" p={2}>
                    <Grid container justifyContent="space-between" spacing={2}>
                        {/* row 1 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="bid x size" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.bid)} X {NumberRoundFormatter(trade.bid_size)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="ask x size" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.ask)} X {NumberRoundFormatter(trade.ask_size)}</Typography>
                        </Grid>
                        {/* row 2 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="last" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.last_price)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="til expiration" /></Typography>
                            <br />
                            <Typography variant="body1">{trade.days_till_expiration} days</Typography>
                        </Grid>
                        {/* row 3 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="day's change" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.change)} ({NumberRoundFormatter(trade.percent_change)}%)</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="day range" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.low_price)} - {PriceFormatter(trade.high_price)}</Typography>
                        </Grid>
                        {/* row 4 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="implied volatility" /></Typography>
                            <br />
                            <Typography variant="body1">{PercentageFormatter(trade.implied_volatility)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="itm probability" /></Typography>
                            <br />
                            <Typography variant="body1">{PercentageFormatter(trade.itm_probability)}</Typography>
                        </Grid>
                        {/* row 5 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="delta" /></Typography>
                            <br />
                            <Typography variant="body1">{NumberRoundFormatter(trade.delta)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="gamma" /></Typography>
                            <br />
                            <Typography variant="body1">{NumberRoundFormatter(trade.gamma)}</Typography>
                        </Grid>
                        {/* row 6 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="theta" /></Typography>
                            <br />
                            <Typography variant="body1">{NumberRoundFormatter(trade.theta)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="vega" /></Typography>
                            <br />
                            <Typography variant="body1">{NumberRoundFormatter(trade.vega)}</Typography>
                        </Grid>
                        {/* row 7 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="rho" /></Typography>
                            <br />
                            <Typography variant="body1">{NumberRoundFormatter(trade.rho)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.notional_value)}</Typography>
                        </Grid>
                        {/* row 8 */}
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="last traded" /></Typography>
                            <br />
                            <Typography variant="body1">{TimestampTimeFormatter(trade.last_trade_date)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="quoted at" /></Typography>
                            <br />
                            <Typography variant="body1">{TimestampTimeFormatter(trade.quote_time)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="intrinsic value" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.intrinsic_value)}</Typography>
                        </Grid>
                        <Grid item xs="6">
                            <Typography variant="button"><MetricLabel label="extrinsic value" /></Typography>
                            <br />
                            <Typography variant="body1">{PriceFormatter(trade.extrinsic_value)}</Typography>
                        </Grid>
                    </Grid>
                </Box>
                :
                null
            }
        </>
    );
}
