import React from "react";
import { Grid, Paper, Box } from "@material-ui/core";

export default function NewTradeCard({strategy}) {

    return (
        <Grid item xs={12}>
            <Paper elevation={2}>
                <Box p={2}>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item>
                            {strategy.type.toUpperCase().replace(/_/g,' ')} <br />
                            04/16/2021: $1000 <br />
                            04/23/2021: $1100 <br />
                            Debit
                        </Grid>
                        <Grid item>
                            HYPOTHETICAL PROFIT <br />
                            +31X <br />
                            {strategy.profit_cap ? `$${strategy.profit_cap}` : 'UNLIMITED'}
                        </Grid>
                        <Grid item>
                            BREAK-EVEN <br />
                            +{(strategy.to_break_even_ratio * 100).toFixed(2)}% <br /> {/* have to dynamically change + or - */}
                            At ${strategy.break_even_price}
                        </Grid>
                        <Grid item>
                            COST / MAX LOSS <br />
                            ${strategy.cost}
                        </Grid>
                        <Grid item>
                            MAX PROFIT <br />
                            {strategy.profit_cap ? `$${strategy.profit_cap}` : 'UNLIMITED'}
                        </Grid>
                        <Grid item>
                            LIQUIDITY <br />
                            VOLUME: {strategy.min_volume} <br />
                            OPEN : {strategy.min_open_interest}
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Grid>
    );
}
