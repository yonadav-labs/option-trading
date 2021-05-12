import React from "react";
import { Link } from "react-router-dom";
import { Paper, Stack, Container, Divider, makeStyles, Typography, FormControl, Select, MenuItem, InputLabel, Card, Grid, Button } from "@material-ui/core";
import { useOktaAuth } from '@okta/okta-react';
import TickerAutocomplete from "../../components/TickerAutocomplete";

const useStyles = makeStyles((theme) => ({
    customPaper: {
        padding: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(7),
            paddingRight: theme.spacing(7),
            margin: theme.spacing(1),
            borderRadius: 50
        }
    }
}));

export default function LandingView(props) {
    const { authState } = useOktaAuth();
    const classes = useStyles();
    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        expirationDisabled,
        expirationTimestampsOptions,
        selectedExpirationTimestamps,
        onExpirationSelectionChange,
        getContracts
    } = props

    return (
        <>
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
                            <InputLabel><Typography variant="h6">Option Expiration Date</Typography></InputLabel>
                            <Select
                                id="expiration-dates"
                                value={selectedExpirationTimestamps}
                                fullWidth
                                placeholder="Select an expiration date"
                                onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                            >
                                <MenuItem disabled value={"none"}><span style={{ color: "gray" }}>Select an expiration date</span></MenuItem>
                                {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem>)}
                            </Select>
                        </FormControl>

                        <Button onClick={getContracts}>Submit</Button>
                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                {!authState.isAuthenticated &&
                    (
                        <Typography variant="body1" align="center" pb={5}>
                            <a href="/signin"><b>Log In</b></a> or <Link to="/signin/register"><b>
                                Sign Up For Free</b></Link> to unlock Cash Secured Put and 3 more Vertical Spread strategies!
                        </Typography>
                    )}
                <Typography variant="h4" align="center">Lorem ipsum dolor sit amet, consectetur adipiscing elit. </Typography>
                <br />
                <Typography variant="body1" align="center">
                    Phasellus erat massa, lacinia gravida mi eu, laoreet rutrum felis. Suspendisse sed velit tristique, vestibulum elit ut, eleifend purus. Quisque tristique laoreet augue luctus accumsan.
                </Typography>
            </Container>
            <br />
            <Grid container direction="row" spacing={2} justifyContent="space-evenly" alignItems="center" >
                <img style={{ height: 344, width: 319 }} src="screen_step_1.png" alt="alt" />
                <img style={{ height: 344, width: 319 }} src="screen_step_2.png" alt="alt" />
                <img style={{ height: 344, width: 319 }} src="screen_step_3.png" alt="alt" />
                <img style={{ height: 344, width: 319 }} src="screen_step_4.png" alt="alt" />
            </Grid>
            <br />
        </>
    );
}
