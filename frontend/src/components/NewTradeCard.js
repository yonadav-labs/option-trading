import React from "react";
import { Grid, Paper, Box } from "@material-ui/core";
import MetricLabel from './MetricLabel.js';

export default function NewTradeCard({ strategy }) {
    return (
        <Grid item sm={12}>
            <Paper elevation={2}>
                <Box p={2}>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                    >
                        <Box p={2} m={-2} bgcolor="#FFF1E4">
                            <Grid item>
                                {strategy.type.toUpperCase().replace(/_/g, ' ')} <br />
                                04/16/2021: $1000 <br />
                                04/23/2021: $1100 <br />
                                Debit
                            </Grid>
                        </Box>
                        <Grid item>
                            <MetricLabel label='hypothetical profit' />
                            +31X <br />
                            {strategy.profit_cap ? `$${strategy.profit_cap}` : 'UNLIMITED'}
                        </Grid>
                        <Grid item>
                            <MetricLabel label='break-even' />
                            +{(strategy.to_break_even_ratio * 100).toFixed(2)}% <br /> {/* have to dynamically change + or - */}
                            At ${strategy.break_even_price}
                        </Grid>
                        <Grid item>
                            <MetricLabel label='cost' />
                            ${strategy.cost}
                        </Grid>
                        <Grid item>
                            <MetricLabel label='max profit' />
                            {strategy.profit_cap ? `$${strategy.profit_cap}` : 'UNLIMITED'}
                        </Grid>
                        <Grid item>
                            <MetricLabel label='liquidity' />
                            VOLUME: {strategy.min_volume} <br />
                            OPEN : {strategy.min_open_interest}
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Grid>
    );
}
