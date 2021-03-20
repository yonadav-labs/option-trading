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
                <Grid item style={{paddingBottom: '0.3rem'}}>
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
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    PREMIUM PRICE OPTIONS
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    CASH TO INVEST
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    STRATEGY TYPE
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    MIN VOLUME
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    MIN OPEN INTEREST
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
            <Box py={2}>
                <Grid item style={{paddingBottom: '0.3rem'}}>
                    TIME SINCE LAST TRADED
                </Grid>
                <Grid item>
                    <MaterialFilter/>
                </Grid>
            </Box>
        </>
    );
}
