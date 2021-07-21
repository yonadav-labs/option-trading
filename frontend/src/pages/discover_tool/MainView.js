import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/styles';
import {
    Grid, Typography, Stack, Pagination, Paper, Divider, Alert, IconButton,
    useMediaQuery, FormControl, Select, MenuItem, Box, Fab, Toolbar, useTheme
} from "@material-ui/core";
import { useOktaAuth } from '@okta/okta-react';
import NewTradeCard from "../../components/cards/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { PriceFormatter, GetGaEventTrackingFunc, TimestampDateFormatter } from '../../utils';
import FilterDrawer from "../../components/FilterDrawer";
import FilterDialog from "../../components/FilterDialog";
import ListItemGrid from "../../components/ListItemGrid";
import MetricLabel from "../../components/MetricLabel";
import FilterItems from "./FilterItems";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const GaEvent = GetGaEventTrackingFunc('strategy screener');

const useStyles = makeStyles({
    autocomplete: {
        "& label": {
            color: 'white',
        },
        "&.MuiAutocomplete-root .MuiAutocomplete-inputRoot": {
            color: 'white',
            background: 'rgba(255, 255, 255, 0.15)',
        },
        "&.MuiAutocomplete-root .Mui-focused .MuiAutocomplete-clearIndicator": {
            color: 'white',
        },
    },
    select: {
        "&.MuiOutlinedInput-root": {
            color: 'white',
            background: 'rgba(255, 255, 255, 0.15)',
        }
    },
});

export default function MainView(props) {
    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        selectedExpirationTimestamp,
        expirationTimestampsOptions,
        onExpirationSelectionChange,
        bestTrades,
        basicInfo,
        getBestTrades,
    } = props;
    const theme = useTheme();
    const classes = useStyles();
    const { authState } = useOktaAuth();

    const [strategySettings, setStrategySettings] = useState({
        "target_price_lower": basicInfo.latestPrice || 0,
        "target_price_upper": basicInfo.latestPrice || 0,
    });
    const [contractFilters, setContractFilters] = useState({});
    const [tradeFilters, setTradeFilters] = useState({});

    // web filter slide out
    const [filterOpen, setFilterOpen] = useState(true)
    const handleFilterCollapse = () => {
        GaEvent('adjust filter collapse');
        setFilterOpen(!filterOpen)
    }

    // mobile responsiveness
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

    // pagination
    const [renderedTrades, setRenderedTrades] = useState([])
    const [noOfPages, setNoOfPages] = useState(null)
    const pageChangeHandler = (event, page) => {
        setRenderedTrades(bestTrades.slice((10 * (page - 1)), (10 * page)))
    }

    // sorting
    const [sortState, setSortState] = useState("hr")
    const [orderState, setOrderState] = useState("desc")

    const sortHandler = (type) => {
        setSortState(type)
        if (orderState === "desc") {
            sortDesc(type)
        } else { sortAsc(type) }
    }

    const orderHandler = (e) => {
        setOrderState(e);
        if (e === "desc") {
            sortDesc(sortState)
        } else { sortAsc(sortState) }
    }

    const sortDesc = (sortBy) => {
        switch (sortBy) {
            case "hr":
                setRenderedTrades(bestTrades.sort((a, b) => b.target_price_profit_ratio - a.target_price_profit_ratio))
                break;
            case "pop":
                setRenderedTrades(bestTrades.sort((a, b) => b.profit_prob - a.profit_prob))
                break;
            case "cost":
                setRenderedTrades(bestTrades.sort((a, b) => b.cost - a.cost))
                break;

            default:
                break;
        }
    }

    const sortAsc = (sortBy) => {
        switch (sortBy) {
            case "hr":
                setRenderedTrades(bestTrades.sort((a, b) => a.target_price_profit_ratio - b.target_price_profit_ratio))
                break;
            case "pop":
                setRenderedTrades(bestTrades.sort((a, b) => a.profit_prob - b.profit_prob))
                break;
            case "cost":
                setRenderedTrades(bestTrades.sort((a, b) => a.cost - b.cost))
                break;

            default:
                break;
        }
    }

    useEffect(() => {
        if (bestTrades) {
            sortHandler(sortState)
            setNoOfPages(Math.ceil(bestTrades.length / 10))
        } else { setRenderedTrades([]) }
    }, [bestTrades]);

    useEffect(() => {
        if (!selectedTicker) {
            setStrategySettings(
                {
                    "target_price_lower": basicInfo.latestPrice || 0,
                    "target_price_upper": basicInfo.latestPrice || 0,
                }
            );
            setContractFilters({});
            setTradeFilters({});
        }
    }, [selectedTicker]);

    useEffect(() => {
        if (selectedTicker && selectedExpirationTimestamp) {
            getBestTrades(strategySettings, contractFilters, tradeFilters);
        }
        onExpirationSelectionChange(selectedExpirationTimestamp);
    }, [strategySettings, contractFilters, tradeFilters, selectedExpirationTimestamp]);

    return (
        <>
            <Grid container item sm minHeight="inherit">
                <Grid component={Paper} container item sm={12} elevation={4} square padding={2} style={isMobile ? { width: "100vw" } : null}>
                    {isMobile ?
                        <>
                            <Grid item xs>
                                <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.companyName}` : <br />}</Typography>
                                <Typography variant="body2">EXP DATE: {selectedExpirationTimestamp ? TimestampDateFormatter(selectedExpirationTimestamp / 1000) : <br />}</Typography>
                                <Typography variant="body2">PRICE TARGET: {PriceFormatter(strategySettings['target_price_lower'])}
                                    {strategySettings['target_price_lower'] !== strategySettings['target_price_upper'] &&
                                        <> - {PriceFormatter(strategySettings['target_price_upper'])}</>}
                                </Typography>
                            </Grid>
                            <Divider />
                        </>
                        :
                        <Grid container alignItems="center" spacing={2} paddingBottom={1}>
                            <Grid item>
                                <Typography variant="subtitle1">Ticker Symbol</Typography>
                            </Grid>
                            <Grid item sm>
                                <TickerAutocomplete
                                    tickers={allTickers}
                                    onChange={onTickerSelectionChange}
                                    size={'small'}
                                    value={selectedTicker}
                                />
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle1">Expiration Date</Typography>
                            </Grid>
                            <Grid item sm={3}>
                                <FormControl fullWidth>
                                    <Select
                                        id="expiration-dates"
                                        value={selectedExpirationTimestamp}
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
                            </Grid>
                        </Grid>
                    }
                    <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                </Grid>
                <FilterDialog
                    open={isMobile && filterOpen}
                    setOpen={handleFilterCollapse}
                >
                    <ListItemGrid>
                        <Typography variant="button" gutterBottom><MetricLabel label="ticker symbol" /></Typography>
                        <TickerAutocomplete
                            tickers={allTickers}
                            onChange={onTickerSelectionChange}
                            size={'medium'}
                            value={selectedTicker}
                            variant="outlined"
                            className={classes.autocomplete}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <Typography variant="button" gutterBottom>Expiration Date</Typography>
                        <FormControl fullWidth>
                            <Select
                                id="expiration-dates"
                                value={selectedExpirationTimestamp}
                                fullWidth
                                placeholder="Select an expiration date"
                                onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="outlined"
                                className={classes.select}
                            >
                                <MenuItem disabled value={"none"}><span style={{ color: "gray" }}>Select an expiration date</span></MenuItem>
                                {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem>)}
                            </Select>
                        </FormControl>
                    </ListItemGrid>
                    <FilterItems
                        strategySettings={strategySettings}
                        contractFilters={contractFilters}
                        tradeFilters={tradeFilters}
                        setStrategySettings={setStrategySettings}
                        setContractFilters={setContractFilters}
                        setTradeFilters={setTradeFilters}
                        basicInfo={basicInfo}
                    />
                </FilterDialog>
                <Grid container xs>
                    <FilterDrawer open={!isMobile && filterOpen}>
                        <FilterItems
                            strategySettings={strategySettings}
                            contractFilters={contractFilters}
                            tradeFilters={tradeFilters}
                            setStrategySettings={setStrategySettings}
                            setContractFilters={setContractFilters}
                            setTradeFilters={setTradeFilters}
                            basicInfo={basicInfo}
                            subHeader={
                                <Toolbar sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="h5" color="white">Filters</Typography>
                                    <IconButton onClick={handleFilterCollapse} sx={{ color: 'white' }}>
                                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                                    </IconButton>
                                </Toolbar>
                            }
                        />
                    </FilterDrawer>
                </Grid>
                <Grid item xs={!isMobile && filterOpen ? 9 : 12}>
                    <Grid container direction="row-reverse" justifyContent="center" alignItems="center">
                        <Grid container item p={2} justifyContent="space-between" alignItems="center">
                            {!filterOpen &&
                                (!isMobile ?
                                    <Grid item>
                                        <IconButton color="inherit" onClick={handleFilterCollapse}><TuneIcon fontSize="large" /></IconButton>
                                    </Grid>
                                    :
                                    <Fab onClick={handleFilterCollapse} variant="extended" size="small" color="primary" aria-label="filters" sx={{ position: 'fixed', top: 'auto', left: '50%', right: 'auto', bottom: 8, transform: 'translateX(-50%)', zIndex: 1 }}>
                                        Filters
                                    </Fab>
                                )
                            }
                            <Grid item>
                                {renderedTrades.length > 0 ?
                                    <Alert severity="info">
                                        Below are results with best potential return for each strategy based on price target.
                                    </Alert>
                                    :
                                    selectedTicker ?
                                        selectedExpirationTimestamp ?
                                            <Alert severity="error">
                                                There are no trades that fit the specified settings.
                                            </Alert>
                                            :
                                            <Alert severity="error">
                                                Select an expiration date.
                                            </Alert>
                                        :
                                        <Alert severity="error">
                                            Select a ticker and expiration date.
                                        </Alert>
                                }
                            </Grid>
                            <Grid item>
                                {renderedTrades.length > 0 &&
                                    <>
                                        <Select
                                            variant="standard"
                                            value={sortState}
                                            onChange={(e) => {
                                                GaEvent('sort by ' + e.target.value + ' ' + orderState);
                                                sortHandler(e.target.value);
                                            }}
                                        >
                                            <MenuItem value={"hr"}>Potential Return</MenuItem>
                                            <MenuItem value={"pop"}>Probability of Profit</MenuItem>
                                            <MenuItem value={"cost"}>Total Cost</MenuItem>
                                        </Select>
                                        <IconButton disableRipple edge="start" size="small"
                                            onClick={() => { GaEvent('sort by ' + sortState + ' asc'); orderHandler("asc"); }}>
                                            <ArrowUpwardIcon color={orderState === "asc" ? "primary" : "disabled"} />
                                        </IconButton>
                                        <IconButton disableRipple edge="start" size="small"
                                            onClick={() => { GaEvent('sort by ' + sortState + ' desc'); orderHandler("desc") }}>
                                            <ArrowDownwardIcon color={orderState === "desc" ? "primary" : "disabled"} />
                                        </IconButton>
                                    </>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container alignItems="center" justifyContent="center" pb={2} px={2}>
                        {!authState.isAuthenticated &&
                            (
                                <Alert severity="warning">
                                    <a href="/signin"><b>Log In</b></a> or <Link to="/signin/register">
                                        <b>Sign Up</b></Link> to unlock 5 more strategies!
                                </Alert>
                            )
                        }
                    </Grid>
                    {renderedTrades.length > 0 &&
                        <>
                            <Grid container>
                                <Stack paddingX={3} spacing={2} width="inherit">
                                    {renderedTrades.map((trade, index) => <NewTradeCard trade={trade} key={index} />)}
                                </Stack>
                            </Grid>
                            <Grid container justifyContent="flex-end" alignItems="flex-end" paddingY={2}>
                                <Pagination count={noOfPages} shape="rounded" onChange={pageChangeHandler} />
                            </Grid>
                        </>
                    }
                </Grid>
            </Grid>
        </>
    );
}
