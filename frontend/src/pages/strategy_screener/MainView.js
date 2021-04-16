import React, { useState, useEffect } from "react";
import { Grid, TextField, Box, Typography, Stack, Autocomplete, Pagination, Paper, Divider, Alert, IconButton } from "@material-ui/core";
import NewTradeCard from "../../components/cards/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterContainer from "../../components/filters/FilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";


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
        onFilterChange,
        filters
    } = props

    // web filter slide out
    const [filterOpen, setFilterOpen] = useState(false)
    const handleFilter = () => {
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
    const [mobileFilter, setMobileFilter] = useState(false)
    const handleMobileFilter = () => {
        setMobileFilter(!mobileFilter)
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
                {isMobile ?
                    null
                    :
                    filterOpen ?
                        <Grid container item sm={2.3} direction="column" alignItems="center" bgcolor='#333741' color="white">
                            <FilterContainer onFilterChange={onFilterChange} filters={filters} handleFilter={handleFilter} initialPrice={basicInfo.regularMarketPrice} />
                        </Grid>
                        :
                        <Grid item py={2} bgcolor='#333741' color="white">
                            <IconButton color="inherit" onClick={handleFilter}><TuneIcon fontSize="large" /></IconButton>
                        </Grid>
                }
                <Grid item sm>
                    <Grid component={Paper} container sm={12} elevation={4} square padding={2}>
                        {isMobile ?
                            <>
                                <Grid container>
                                    <Grid item xs>
                                        <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.shortName}` : <br />}</Typography>
                                        <Typography variant="body2">{selectedExpirationTimestamp ? selectedExpirationTimestamp.label : <br />}</Typography>
                                        <Typography variant="body2">${filters.priceTarget}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton color="inherit" onClick={handleMobileFilter}>
                                            <TuneIcon fontSize="large" />
                                        </IconButton>
                                    </Grid>
                                    {mobileFilter ?
                                        <>
                                            <div style={{ position: "absolute", right: 0, top: "9vh", zIndex: 100 }}>
                                                <Grid container direction="column" justifyContent="center" alignItems="center" bgcolor='#333741' color="white" height="100%">
                                                    <FilterContainer
                                                        onFilterChange={onFilterChange}
                                                        filters={filters}
                                                        initialPrice={basicInfo.regularMarketPrice}
                                                        isMobile={isMobile}
                                                        handleMobileFilter={handleMobileFilter}
                                                        allTickers={allTickers}
                                                        onTickerSelectionChange={onTickerSelectionChange}
                                                        selectedTicker={selectedTicker}
                                                        expirationTimestampsOptions={expirationTimestampsOptions}
                                                        selectedExpirationTimestamp={selectedExpirationTimestamp}
                                                        onExpirationSelectionChange={onExpirationSelectionChange}
                                                    />
                                                </Grid>
                                            </div>
                                        </>
                                        :
                                        null
                                    }
                                </Grid>
                                <Divider />
                            </>
                            :
                            <Grid container alignItems="center" spacing={2} paddingBottom={4}>
                                <Grid item>
                                    <Typography variant="subtitle1">Enter Ticker Symbol</Typography>
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
                        <NewTickerSummary basicInfo={basicInfo} />
                    </Grid>
                    <Grid container alignItems="center" justifyContent="center" padding={2}>
                        <Alert severity="info">Strategies below offer the best returns based on target price.</Alert>
                    </Grid>
                    <Grid container>
                        <Stack paddingX={3} spacing={2} width="inherit">
                            {renderedTrades.map((trade, index) => <NewTradeCard trade={trade} key={index} />)}
                        </Stack>
                    </Grid>
                    <Grid container justifyContent="flex-end" alignItems="flex-end" paddingY={2}>
                        <Pagination count={noOfPages} shape="rounded" onChange={pageChangeHandler} />
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
