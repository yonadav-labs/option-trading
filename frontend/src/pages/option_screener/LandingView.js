import React from "react";
import { Paper, Stack, Container, Divider, makeStyles, Typography, FormControl, Select, MenuItem, InputLabel, Grid, Chip, Box } from "@material-ui/core";
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
    const classes = useStyles();
    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        expirationDisabled,
        expirationTimestampsOptions,
        selectedExpirationTimestamps,
        onExpirationSelectionChange,
        debouncedGetContracts,
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

                        <FormControl disabled={expirationDisabled} fullWidth style={{ overflowX: "auto", }}>
                            <InputLabel><Typography variant="h6">Option Expiration Date</Typography></InputLabel>
                            <Select
                                id="expiration-dates"
                                value={selectedExpirationTimestamps}
                                multiple
                                fullWidth
                                placeholder="Select an expiration date"
                                onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                onClose={debouncedGetContracts}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                    },
                                    getContentAnchorEl: () => null,
                                }}
                                renderValue={
                                    (selectedExpirationTimestamps) => {
                                        let sorted
                                        sorted = selectedExpirationTimestamps.sort((a, b) => (a.value > b.value) ? 1 : -1)
                                        return <Box>{sorted.map(date => <Chip key={date.value} label={date.label} />)}</Box>
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
        </Container>
    );
}
