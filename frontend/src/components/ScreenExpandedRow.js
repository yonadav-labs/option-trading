import React, { useContext } from 'react';
import { Grid, Typography, Link } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { PriceFormatter, PercentageFormatter, TimestampTimeFormatter, NumberRoundFormatter } from '../utils';
import MetricLabel from './MetricLabel.js';
import UserContext from '../UserContext';

export default function ScreenExpandedRow(props) {
    const { contract } = props;
    const { user } = useContext(UserContext);

    return (
        (
            contract ?
                <Grid container>
                    {/* row 1 */}
                    <Grid container justifyContent="space-between" py={1}>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="bid x size" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}</Typography>
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="ask x size" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}</Typography>
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="notional value" /></Typography>
                            <br />
                            <Typography variant="body2">{PriceFormatter(contract.notional_value)}</Typography>
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="vega" /></Typography>
                            <br />
                            <Typography variant="body2">{NumberRoundFormatter(contract.vega)}</Typography>
                        </Grid>
                        <Grid item sm="2" xs="6">
                            <Typography variant="button"><MetricLabel label="last traded" /></Typography>
                            <br />
                            <Typography variant="body2">{TimestampTimeFormatter(contract.last_trade_date)}</Typography>
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
                    </Grid>
                </Grid>
                :
                null
        )
    );
}

