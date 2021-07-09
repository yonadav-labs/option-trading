import React, { useState, useEffect } from "react";
import {
    Paper, Stack, Container, Divider, Typography, FormControl, Select, MenuItem, InputLabel,
    Card, Grid, Chip, useTheme, Alert
} from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import { makeStyles } from '@material-ui/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import StrategyRow from "../../components/StrategyRow";

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
        },
        chip: {
            "&.MuiChip-root .MuiChip-label": {
                padding: 0
            }
        }
    }, theme);
    const classes = useStyles();

    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        strategyDisabled,
        selectedStrategy,
        onStrategySelectionChange,
        availableStrategies,
        disAllowedStrategies,
        user
    } = props;

    const [renderedAvailableStrategies, setRenderedAvailableStrategies] = useState([]);
    const [renderedDisAllowedStrategies, setRenderedDisAllowedStrategies] = useState([]);
    const [chipState, setChipState] = useState({
        basic: true,
        spreads: true,
        advanced: true,
        bullish: true,
        bearish: true,
        neutral: true,
        volatile: true
    });

    const toggleChip = (chipChoice) => {
        setChipState(prevState => ({ ...prevState, [chipChoice]: !chipState[chipChoice] }));
    }

    const filterChips = () => {
        let filters = [];
        let filteredAvailableStrategies = [];
        let filteredDisAllowedStrategies = [];

        for (const [key, value] of Object.entries(chipState)) {
            if (value) {
                filters.push(key);
            }
        }

        availableStrategies.map(strat => {
            if (strat.sentiment.some(s => filters.indexOf(s) >= 0) && filters.includes(strat.level)) { filteredAvailableStrategies.push(strat); }
        });

        disAllowedStrategies.map(strat => {
            if (strat.sentiment.some(s => filters.indexOf(s) >= 0) && filters.includes(strat.level)) { filteredDisAllowedStrategies.push(strat); }
        });

        setRenderedAvailableStrategies(filteredAvailableStrategies);
        setRenderedDisAllowedStrategies(filteredDisAllowedStrategies);
    }

    useEffect(() => {
        filterChips()
    }, [chipState, availableStrategies]);

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
                        <FormControl disabled={strategyDisabled} fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Strategy</Typography></InputLabel>
                            <InputLabel shrink={false}>{selectedStrategy ? "" :
                                <Typography variant="body1" style={{ color: "#cbcbcb" }}>Select a strategy...</Typography>}
                            </InputLabel>
                            <Select
                                id="expiration-dates"
                                value={selectedStrategy}
                                fullWidth
                                onChange={(e) => onStrategySelectionChange(e.target.value)}
                                style={{ paddingBottom: "5px" }}
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
                            >
                                {availableStrategies.map(strat => <MenuItem value={strat}>{strat.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                <Typography variant="h3" align="center">Build Your Strategy</Typography>
                <Typography variant="body1" align="center">
                    Build an options strategy and get real-time analysis on the trade.
                    We calculate key data for you, including probability of profit and breakeven price.
                    Visualize potential returns with our interactive graph and chart.
                </Typography>
            </Container>
            <br />
            <Grid container justifyContent="center">
                <Grid item >
                    {user === null || user.subscription === null || user.subscription.status !== "ACTIVE" ?
                        <Alert severity="warning">
                            Unlock all strategies by going pro!
                        </Alert>
                        :
                        null
                    }
                </Grid>
            </Grid>
            <br />
            <Card p={2}>
                <Grid container px={2} py={3} justifyContent="space-between">
                    <Grid item xs={5.8}>
                        <Grid container justifyContent="space-evenly" alignItems="center">
                            <Typography variant="body2">How are you feeling? <span>&nbsp;</span></Typography>
                            <Grid>
                                <Chip
                                    variant={chipState.bullish ? null : "outlined"}
                                    label={<div><TrendingUpIcon /> <Typography variant="chip">bullish</Typography> </div>}
                                    clickable onClick={() => toggleChip("bullish")}
                                    className={classes.chip}
                                    style={{ width: 110 }}
                                />
                                <Chip
                                    variant={chipState.bearish ? null : "outlined"}
                                    label={<div><TrendingDownIcon /> <Typography variant="chip">bearish</Typography> </div>}
                                    clickable onClick={() => toggleChip("bearish")}
                                    className={classes.chip}
                                    style={{ width: 110 }}
                                />
                                <Chip
                                    variant={chipState.neutral ? null : "outlined"}
                                    label={<div><TrendingFlatIcon /> <Typography variant="chip">neutral</Typography></div>}
                                    clickable onClick={() => toggleChip("neutral")}
                                    className={classes.chip}
                                    style={{ width: 110 }}
                                />
                                <Chip
                                    variant={chipState.volatile ? null : "outlined"}
                                    label={<div><TrendingUpIcon /> <Typography variant="chip">volatile</Typography> </div>}
                                    clickable onClick={() => toggleChip("volatile")}
                                    className={classes.chip}
                                    style={{ width: 110 }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={5.6}>
                        <Grid container justifyContent="space-evenly" alignItems="center">
                            <Typography variant="body2">What is your experience level? </Typography>
                            <Grid>
                                <Chip
                                    variant={chipState.basic ? null : "outlined"}
                                    clickable onClick={() => toggleChip("basic")}
                                    label={<Typography variant="chip">basic</Typography>}
                                    className={classes.chip}
                                    style={chipState.basic ? { width: 110, backgroundColor: "#DDFFFA", color: "#006868" } : { width: 110, color: "#006868", borderColor: "#006868" }}
                                />
                                <Chip
                                    variant={chipState.spreads ? null : "outlined"}
                                    clickable onClick={() => toggleChip("spreads")}
                                    label={<Typography variant="chip">spreads</Typography>}
                                    className={classes.chip}
                                    style={chipState.spreads ? { width: 110, backgroundColor: "#FFF3B7", color: "#755400" } : { width: 110, color: "#755400", borderColor: "#755400" }}
                                />
                                <Chip
                                    variant={chipState.advanced ? null : "outlined"}
                                    clickable onClick={() => toggleChip("advanced")}
                                    label={<Typography variant="chip">advanced</Typography>}
                                    className={classes.chip}
                                    style={chipState.advanced ? { width: 110, backgroundColor: "#FFF2F3", color: "#65252B" } : { width: 110, color: "#65252B", borderColor: "#65252B" }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Divider orientation="horizontal" flexItem />
                <Stack divider={<Divider orientation="horizontal" flexItem />}>
                    {renderedAvailableStrategies.length > 0 && renderedAvailableStrategies.map((strat, index) => {
                        return <StrategyRow strategy={strat} key={index} onStrategySelectionChange={onStrategySelectionChange} />
                    })}
                    {renderedDisAllowedStrategies.length > 0 && renderedDisAllowedStrategies.map((strat, index) => {
                        return <StrategyRow strategy={strat} key={index} onStrategySelectionChange={onStrategySelectionChange} disabled={true} />
                    })}
                </Stack>
            </Card>
            <br />
        </Container>
    );
}
