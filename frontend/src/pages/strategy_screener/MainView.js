import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, TextField, Typography, Stack, Autocomplete, Pagination, Paper, Divider, Alert, IconButton } from "@material-ui/core";
import { useOktaAuth } from '@okta/okta-react';
import NewTradeCard from "../../components/cards/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterContainer from "../../components/filters/FilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import { PriceFormatter } from '../../utils';

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
        filters
    } = props

    // web filter slide out
    const [filterOpen, setFilterOpen] = useState(true)
    const handleFilterCollapse = () => {
        setFilterOpen(!filterOpen)
    }

    // mobile responsiveness
    const [screenWidth, setScreenWidth] = useState(window.innerWidth)
    const isMobile = screenWidth <= 800
    const handleWindowSizeChange = () => {
        setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleWindowSizeChange)

    // mobile filter state
    const [showMobileFilter, setShowMobileFilter] = useState(true)
    const handleMobileFilterCollapse = () => {
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
            setRenderedTrades(bestTrades.slice(0, 10))
            setNoOfPages(Math.ceil(bestTrades.length / 10))
        } else { setRenderedTrades([]) }
    }, [bestTrades])

    return (
        <>
            <Grid container minHeight="inherit">
                {!isMobile &&
                    <>
                        <Grid container item sm={2.3} direction="column" alignItems="center"
                            bgcolor='#333741' color="white" style={{ display: filterOpen ? "block" : "none" }}>
                            <FilterContainer onFilterChange={onFilterChange} filters={filters}
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
                                    <Autocomplete
                                        id="expiration-dates"
                                        options={expirationTimestampsOptions}
                                        value={selectedExpirationTimestamp}
                                        onChange={onExpirationSelectionChange}
                                        size="small"
                                        fullWidth
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Select an expiration date"
                                            />
                                        )}
                                        getOptionLabel={(option) => option.label}
                                    />
                                </Grid>
                            </Grid>
                        }
                        <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                    </Grid>
                    <Grid container alignItems="center" justifyContent="center" padding={2}>
                        {!authState.isAuthenticated &&
                            (
                                <Alert severity="warning" style={{ marginBottom: '1rem' }}>
                                    <a href="/signin"><b>LOG IN</b></a> or <Link to="/signin/register"><b>
                                        SIGN UP FOR FREE</b></Link> to unlock cash secured put and 3 more vertical spread strategies!
                                </Alert>
                            )
                        }
                        {renderedTrades.length > 0 ?
                            <Alert severity="info">
                                Below are the trading ideas with best potential return for each strategy based on price target.
                                Please adjust the settings to discover your favorite ones.
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
                    <Grid container>
                        <Stack paddingX={3} spacing={2} width="inherit">
                            {renderedTrades.map((trade, index) => <NewTradeCard trade={trade} key={index} />)}
                        </Stack>
                    </Grid>
                    {/* <Grid container justifyContent="flex-end" alignItems="flex-end" paddingY={2}>
                        <Pagination count={noOfPages} shape="rounded" onChange={pageChangeHandler} />
                    </Grid> */}
                </Grid>
            </Grid>
        </>
    );
}
