import React, { useState, useEffect } from "react";
import { Grid, TextField, Box, Typography, Autocomplete, Pagination } from "@material-ui/core";
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

    // mobile responsiveness
    const [screenWidth, setScreenWidth] = useState(window.innerWidth)
    const isMobile = screenWidth <= 800
    const handleWindowSizeChange = () => {
        setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleWindowSizeChange)

    // mobile filter state
    const [mobileFilter, setMobileFilter] = useState(false)
    const handleClick = () => {
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
        } else {setRenderedTrades([])}
    }, [bestTrades])

    return (
        <>
            <Grid container direction="row">
                {isMobile ? 
                    null
                    :
                    <Grid item sm={2}>
                        <Box bgcolor='#333741' color="white" height="105%" style={{ marginRight: '-2rem' }}>
                            <Grid container direction="column" justifyContent="center" alignItems="center" className="filter-label">
                                <FilterContainer onFilterChange={onFilterChange} filters={filters} initialPrice={basicInfo.regularMarketPrice} />
                            </Grid>
                        </Box>
                    </Grid>
                }
                <Grid item xs={ isMobile ? 12 : 10}>
                    <Box boxShadow={4} p={2} style={isMobile ? null : { marginLeft: '2rem' }}>
                        { isMobile ?
                            <Box py={2} borderBottom={1}>
                                <Grid container direction="row" justifyContent="center" alignItems="center">
                                    {   selectedExpirationTimestamp ? 
                                        <Grid item xs={11}>
                                            <Typography variant="h5">{`${basicInfo.symbol} - ${basicInfo.shortName}`}</Typography>
                                            <Typography variant="h5">{selectedExpirationTimestamp.label}</Typography>
                                            <Typography variant="h5">${filters.priceTarget}</Typography>
                                        </Grid>
                                        :
                                        null
                                    }
                                    <Grid item xs={1}><div onClick={handleClick}><TuneIcon fontSize="large"/></div></Grid>
                                    { mobileFilter ?
                                        <>
                                            <div style={{position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 20, backgroundColor: "rgba(0,0,0,0.6)"}}></div>
                                            <div style={{position: "absolute", right: 0, top: "9vh", zIndex: 100}}>
                                                <Box bgcolor='#333741' color="white" height="100%">
                                                    <Grid container direction="column" justifyContent="center" alignItems="center" className="filter-label">
                                                        <FilterContainer 
                                                            onFilterChange={onFilterChange} 
                                                            filters={filters} 
                                                            initialPrice={basicInfo.regularMarketPrice} 
                                                            isMobile={isMobile} 
                                                            handleClick={handleClick}
                                                            allTickers={allTickers}
                                                            onTickerSelectionChange={onTickerSelectionChange}
                                                            selectedTicker={selectedTicker}
                                                            expirationTimestampsOptions={expirationTimestampsOptions}
                                                            selectedExpirationTimestamp={selectedExpirationTimestamp}
                                                            onExpirationSelectionChange={onExpirationSelectionChange}
                                                            />
                                                    </Grid>
                                                </Box>
                                            </div>
                                        </>
                                        :
                                        null
                                    }
                                </Grid>
                            </Box>
                            :
                            <Box py={2}>
                                <Grid container direction="row" justifyContent="center" alignItems="center">
                                    <Grid item sm={2}>
                                        <Typography variant="title">Enter Ticker Symbol</Typography>
                                    </Grid>
                                    <Grid item sm={6}>
                                        <TickerAutocomplete
                                            tickers={allTickers}
                                            onChange={onTickerSelectionChange}
                                            size={'small'}
                                            value={selectedTicker}
                                        />
                                    </Grid>
                                    <Grid item sm={2} style={{ paddingLeft: '1rem' }}>
                                        <Typography variant="title">Expiration Date</Typography>
                                    </Grid>
                                    <Grid item sm={2}>
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
                            </Box>
                        }
                        <Box py={3}>
                            <NewTickerSummary basicInfo={basicInfo} />
                        </Box>
                    </Box>
                    <Box p={5} bgcolor='#F2F2F2' minHeight="100vh" height="100%" style={isMobile ? null : { marginLeft: '2rem' }}>
                        <Grid container spacing={2} direction="column" justifyContent="center">
                            {renderedTrades.map((trade, index) => <NewTradeCard trade={trade} key={index} />)}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            <Grid container justifyContent="flex-end">
                <Pagination count={noOfPages} shape="rounded" onChange={pageChangeHandler} />
            </Grid>
        </>
    );
}
