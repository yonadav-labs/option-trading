import React, { useState } from "react";
import { Paper, Stack, Container, Divider, Typography, FormControl, Select, MenuItem, InputLabel, Card, Grid, Chip, useTheme } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import { makeStyles } from '@material-ui/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import StrategyRow from "../../components/StrategyRow";
import { strategies } from "../../blobs/Strategies";

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
    } = props

    const [chipState, setChipState] = useState({
        basic: true,
        spread: true,
        advanced: true,
        bullish: true,
        bearish: true,
        neutral: true,
        volatile: true
    })

    const toggleChip = (chipChoice) => {
        setChipState(prevState => ({ ...prevState, [chipChoice]: !chipState[chipChoice] }));
    }

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
                                        horizontal: "left"
                                    },
                                    getContentAnchorEl: () => null,
                                }}
                            >
                                {strategies.map(strat => <MenuItem value={strat}>{strat.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                <Typography variant="h4" align="center">Build</Typography>
                <br />
                <Typography variant="body1" align="center">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis auctor elit sed vulputate mi sit amet mauris.
                </Typography>
            </Container>
            <br />
            <Card p={2}>
                <Grid container px={2} py={3} justifyContent="space-between">
                    <Grid item xs={5.8}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">How are you feeling?</Typography>
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
                    <Grid item xs={5.5}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">What is your experience level?</Typography>
                            <Chip
                                variant={chipState.basic ? null : "outlined"}
                                clickable onClick={() => toggleChip("basic")}
                                label={<Typography variant="chip">basic</Typography>}
                                className={classes.chip}
                                style={chipState.basic ? { width: 110, backgroundColor: "#DDFFFA", color: "#006868" } : { width: 110, color: "#006868", borderColor: "#006868" }}
                            />
                            <Chip
                                variant={chipState.spread ? null : "outlined"}
                                clickable onClick={() => toggleChip("spread")}
                                label={<Typography variant="chip">spreads</Typography>}
                                className={classes.chip}
                                style={chipState.spread ? { width: 110, backgroundColor: "#FFF3B7", color: "#755400" } : { width: 110, color: "#755400", borderColor: "#755400" }}
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
                <Divider orientation="horizontal" flexItem />
                <Stack divider={<Divider orientation="horizontal" flexItem />}>
                    {strategies.map(strat => {
                        return <StrategyRow strategy={strat} />
                    })}
                </Stack>
            </Card>
            <br />
        </Container>
    );
}
