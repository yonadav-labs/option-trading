import React from "react";
import { Paper, Stack, Container, Divider, Typography, FormControl, Select, MenuItem, InputLabel, Grid, Chip, Box, useTheme } from "@material-ui/core";
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
        expirationDisabled,
        expirationTimestampsOptions,
        selectedExpirationTimestamps,
        onExpirationSelectionChange,
        setPageState,
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
                        <FormControl disabled={expirationDisabled} fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Expiration Dates</Typography></InputLabel>
                            <InputLabel shrink={false}>{selectedExpirationTimestamps.length > 0 ? "" :
                                <Typography variant="body1" style={{ color: "#cbcbcb" }}>Select one or more expiration dates...</Typography>}</InputLabel>
                            <Select
                                id="expiration-dates"
                                value={selectedExpirationTimestamps}
                                multiple
                                fullWidth
                                placeholder="Select an expiration date"
                                onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                onClose={(e) => setPageState(false)}
                                variant="standard"
                                MenuProps={{
                                    style: {
                                        maxHeight: "400px",
                                    },
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "center"
                                    },
                                    getContentAnchorEl: () => null,
                                }}
                                renderValue={
                                    (selectedExpirationTimestamps) => {
                                        let sorted
                                        sorted = selectedExpirationTimestamps.sort((a, b) => (a.value > b.value) ? 1 : -1)
                                        return <Box>{sorted.map(date => <Chip size="small" key={date.value} label={date.label} />)}</Box>
                                    }
                                }
                            >
                                {expirationTimestampsOptions.map((date, index) => <MenuItem value={date} key={index}> {date.label} </MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                <Typography variant="h4" align="center">Screen Option Contracts</Typography>
                <br />
                <Typography variant="body1" align="center">
                    Find options that match your trading goals. View the options chains for the stock you selected and use filters to screen for options that match your strategy.
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
                        <Typography variant="subtitle1">Select an expiration date</Typography>
                        <Typography variant="body2">Your timeframe(s) for your trade</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="screen_step_3.png" alt="step 3" />
                        <Typography variant="button">Step 3</Typography>
                        <Typography variant="subtitle1">Personalize filters</Typography>
                        <Typography variant="body2">Use filters to screen the options chain</Typography>
                    </Grid>
                </Box>
                <Box px={2} py={4} bgcolor="white" borderRadius={1}>
                    <Grid container direction="column" alignItems="center">
                        <img style={{ height: 200, width: 270, marginBottom: 8 }} src="screen_step_4.png" alt="step 4" />
                        <Typography variant="button">Step 4</Typography>
                        <Typography variant="subtitle1">Browse the options</Typography>
                        <Typography variant="body2">Find the option contracts that suit your needs</Typography>
                    </Grid>
                </Box>
            </Grid>
        </Container>
    );
}
