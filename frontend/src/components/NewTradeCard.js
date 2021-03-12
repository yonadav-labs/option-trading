import React from "react";
import { Grid, Paper, Box } from "@material-ui/core";

export default function NewTradeCard() {
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
                            LONG CALL <br />
                            04/16/2021: $1000 <br />
                            04/23/2021: $1100 <br />
                            Debit
                        </Grid>
                        <Grid item>
                            HYPOTHETICAL PROFIT <br />
                            +31X <br />
                            $19,690.29
                        </Grid>
                        <Grid item>
                            BREAK-EVEN <br />
                            +28.82% <br />
                            At $1006.45
                        </Grid>
                        <Grid item>
                            COST / MAX LOSS <br />
                            $645
                        </Grid>
                        <Grid item>
                            MAX PROFIT <br />
                            UNLIMITED
                        </Grid>
                        <Grid item>
                            LIQUIDITY <br />
                            VOLUME: 215 <br />
                            OPEN : 742
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Grid>
    );
}
