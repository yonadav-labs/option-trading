import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Typography, Stack, Pagination, Paper, Divider, Alert, IconButton, useMediaQuery, FormControl, Select, MenuItem, Box } from "@material-ui/core";
import { useOktaAuth } from '@okta/okta-react';
import NewTradeCard from "../../components/cards/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterContainer from "../../components/filters/FilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { PriceFormatter, GetGaEventTrackingFunc } from '../../utils';

const GaEvent = GetGaEventTrackingFunc('strategy screener');

export default function MainView(props) {
    const { authState } = useOktaAuth();

    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        selectedExpirationTimestamp,
        expirationTimestampsOptions,
        onExpirationSelectionChange,
        bestTrades,
        basicInfo,
        onFilterChange,
        onTextFilterChange,
        filters
    } = props

    // web filter slide out
    const [filterOpen, setFilterOpen] = useState(true)
    const handleFilterCollapse = () => {
        GaEvent('adjust filter collapse');
        setFilterOpen(!filterOpen)
    }

    // mobile responsiveness
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

    // mobile filter state
    const [showMobileFilter, setShowMobileFilter] = useState(true)
    const handleMobileFilterCollapse = () => {
        GaEvent('adjust mobile filter collapse');
        setShowMobileFilter(!showMobileFilter)
    }

    // pagination
    const [renderedTrades, setRenderedTrades] = useState([])
    const [noOfPages, setNoOfPages] = useState(null)
    const pageChangeHandler = (event, page) => {
        setRenderedTrades(bestTrades.slice((10 * (page - 1)), (10 * page)))
    }
    useEffect(() => {
        if (bestTrades) {
            sortHandler(sortState)
            setNoOfPages(Math.ceil(bestTrades.length / 10))
        } else { setRenderedTrades([]) }
    }, [bestTrades])

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

    return (
        <>
            <Grid container minHeight="inherit">
                {!isMobile &&
                    <>
                        <Grid container item sm={2.3} direction="column" alignItems="center"
                            bgcolor='#333741' color="white" style={{ display: filterOpen ? "block" : "none" }}>
                            <FilterContainer onFilterChange={onFilterChange} onTextFilterChange={onTextFilterChange} filters={filters}
                                handleFilterCollapse={handleFilterCollapse} initialPrice={basicInfo.regularMarketPrice} />
                        </Grid>
                        <Grid item py={2} bgcolor='#333741' color="white" style={{ display: filterOpen ? "none" : "block" }} >
                            <IconButton color="inherit" onClick={handleFilterCollapse}><TuneIcon fontSize="large" /></IconButton>
                        </Grid>
                    </>
                }
                <Grid item sm>
                    <Grid component={Paper} container sm={12} elevation={4} square padding={2} style={isMobile ? { width: "100vw" } : null}>
                        {isMobile ?
                            <>
                                <Grid container>
                                    <Grid item xs>
                                        <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.shortName}` : <br />}</Typography>
                                        <Typography variant="body2">EXP DATE: {selectedExpirationTimestamp ? selectedExpirationTimestamp.label : <br />}</Typography>
                                        <Typography variant="body2">PRICE TARGET: {PriceFormatter(filters.targetPriceLower)}
                                            {filters.targetPriceLower !== filters.targetPriceUpper &&
                                                <> - {PriceFormatter(filters.targetPriceUpper)}</>}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton color="inherit" onClick={handleMobileFilterCollapse}>
                                            <TuneIcon fontSize="large" />
                                        </IconButton>
                                    </Grid>
                                    <div style={{ position: "absolute", right: 0, top: "9vh", zIndex: 100, display: showMobileFilter ? "block" : "none" }}>
                                        <Grid container direction="column" justifyContent="center" alignItems="center" bgcolor='#333741' color="white" height="100%">
                                            <FilterContainer
                                                onFilterChange={onFilterChange}
                                                onTextFilterChange={onTextFilterChange}
                                                filters={filters}
                                                initialPrice={basicInfo.regularMarketPrice}
                                                isMobile={isMobile}
                                                handleMobileFilterCollapse={handleMobileFilterCollapse}
                                                allTickers={allTickers}
                                                onTickerSelectionChange={onTickerSelectionChange}
                                                selectedTicker={selectedTicker}
                                                expirationTimestampsOptions={expirationTimestampsOptions}
                                                selectedExpirationTimestamp={selectedExpirationTimestamp}
                                                onExpirationSelectionChange={onExpirationSelectionChange}
                                            />
                                        </Grid>
                                    </div>
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
                    <Grid container direction="row-reverse" justifyContent="center" alignItems="center">
                        {renderedTrades.length > 0 ?
                            <Box pt={2} px={2} style={{ float: "right" }} >
                                <Select
                                    value={sortState}
                                    onChange={(e) => {
                                        GaEvent('sort by ' + e.target.value + ' ' + orderState);
                                        sortHandler(e.target.value);
                                    }}
                                >
                                    <MenuItem value={"hr"}>Hypothetical Return</MenuItem>
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
                            </Box>
                            :
                            null
                        }
                        <Box style={{ display: "inline-flex" }} p={2}>
                            {renderedTrades.length > 0 ?
                                <Alert severity="info">
                                    Below are the trading ideas with best potential return for each strategy based on price target.
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
                        </Box>
                    </Grid>
                    <Grid container alignItems="center" justifyContent="center" pb={2} px={2}>
                        {!authState.isAuthenticated &&
                            (
                                <Alert severity="warning">
                                    <a href="/signin"><b>Log In</b></a> or <Link to="/signin/register"><b>
                                        Sign Up for Free</b></Link> to unlock cash secured put and 3 more vertical spread strategies!
                                </Alert>
                            )
                        }
                    </Grid>
                    {renderedTrades.length > 0 ?
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
                        :
                        null
                    }
                </Grid>
            </Grid>
        </>
    );
}
