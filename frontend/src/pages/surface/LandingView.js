import React from "react";
import { Paper, Stack, Container, Divider, Typography, FormControl, Select, MenuItem, InputLabel, Grid, Box, useTheme } from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import TickerAutocomplete from "../../components/TickerAutocomplete";

export default function LandingView(props) {
    const theme = useTheme();
    const useStyles = makeStyles({
        customPaper: {
            padding: theme.spacing(3),
            [theme.breakpoints.up('sm')]: {
                paddingLeft: theme.spacing(7),
                paddingRight: theme.spacing(7),
                margin: theme.spacing(1),
                borderRadius: 50
            }
        }
    }, theme);
    const classes = useStyles();
    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        onFilterChange,
        contractTypeOptions,
        targetOptions,
        filters
    } = props

    return (
        <Container style={{ minHeight: "inherit", padding: 0 }}>
            <br />
            <Container >
                <Paper className={classes.customPaper} elevation={4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" variant="middle" flexItem />} spacing={2}>
                        <TickerAutocomplete
                            tickers={allTickers}
                            onChange={onTickerSelectionChange}
                            value={selectedTicker}
                            displayLabel
                        />

                        <FormControl disabled={!selectedTicker} fullWidth>
                            <InputLabel style={{ marginTop: 8, marginBottom: 0 }}><Typography variant="h6">Type</Typography></InputLabel>
                            <Select
                                id="contract-type"
                                fullWidth
                                defaultValue={filters.contractType}
                                onChange={(e) => onFilterChange(e.target.value, 'contractType')}
                                style={{ paddingLeft: 15 }}
                                variant="standard"
                            >
                                {contractTypeOptions.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl disabled={!selectedTicker} fullWidth>
                            <InputLabel style={{ marginTop: 8, marginBottom: 0 }}><Typography variant="h6">Metric</Typography></InputLabel>
                            <Select
                                id="metric"
                                defaultValue={filters.metric}
                                fullWidth
                                onChange={(e) => onFilterChange(e.target.value, 'metric')}
                                style={{ paddingLeft: 15 }}
                                variant="standard"
                            >
                                {targetOptions.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)}
                                {filters.contractType == 'call' ?
                                    <MenuItem value={"apr"} key={4}> Annualized Covered Call Premium Profit if OTM </MenuItem>
                                    :
                                    <MenuItem value={"apr"} key={4}> Annualized Cash Secured Put Premium Profit if OTM </MenuItem>
                                }
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                <Typography variant="h4" align="center">Scan all Options Chains with Heatmap.</Typography>
                <br />
                <Typography variant="body1" align="center">
                    Spot most active trades using Open Interest, Volume, and Implied Volatility Surface.<br />
                    Quickly identify calls/puts to sell by their annualized premium return and probability of expiring out of the money.
                </Typography>
            </Container>
            <br />
            <Grid container direction="row" justifyContent="space-evenly" alignItems="center" >
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="screen_step_1.png" alt="step 1" />
                        <Typography variant="button">Step 1</Typography>
                        <Typography variant="subtitle1">Select a stock by its ticker</Typography>
                        <Typography variant="body2">AAPL, AMZN, TSLA...</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="screen_step_2.png" alt="step 2" />
                        <Typography variant="button">Step 2</Typography>
                        <Typography variant="subtitle1">Select type and metric</Typography>
                        <Typography variant="body2">Your attributes for the view.</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="screen_step_3.png" alt="step 3" />
                        <Typography variant="button">Step 3</Typography>
                        <Typography variant="subtitle1">Personalize filters</Typography>
                        <Typography variant="body2" align="center">Customize your expiration date<br /> and strike price</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="screen_step_4.png" alt="step 4" />
                        <Typography variant="button">Step 4</Typography>
                        <Typography variant="subtitle1">Quickly identify calls/puts to sell</Typography>
                        <Typography variant="body2">Spot trades by their return and expiration</Typography>
                    </Grid>
                </Box>
            </Grid>
        </Container>
    );
}
