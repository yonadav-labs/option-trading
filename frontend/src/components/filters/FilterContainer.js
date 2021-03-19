import React from "react";
import { Grid, Box } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import MaterialFilter from "./MaterialFilter";

export default function FilterContainer() {

    return (
        <>
            <Box pb={2}>
            <Grid item>
                <Grid container direction="row" justify="space-between" alignItems="center">
                    <Grid item><span style={{fontSize: '1.3rem'}}>SETTINGS</span></Grid>
                    <Grid item><TuneIcon fontSize="large"/> </Grid>
                </Grid>
            </Grid>
            </Box>
            <Box p={4} py={3} bgcolor='#14161b' mx={-4}>
                <Grid item>
                    PRICE RANGE ON EXP DAY
                </Grid>
                <Grid item style={{paddingBottom: '0.5rem'}}>
                    <MaterialFilter/>
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item>
                    PREMIUM PRICE OPTIONS
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item>
                    CASH TO INVEST
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item>
                    STRATEGY TYPE
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item>
                    MIN VOLUME
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item>
                    MIN OPEN INTEREST
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item>
                    TIME SINCE LAST TRADED
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
        </>
    );
}
