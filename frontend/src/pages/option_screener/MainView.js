import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Paper, Pagination, Divider, IconButton, useMediaQuery, FormControl, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Box, TableContainer, Chip } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import ScreenFilterContainer from "../../components/filters/ScreenFilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import { GetGaEventTrackingFunc } from '../../utils';
import ScreenRow from "../../components/ScreenRow";
import CancelIcon from '@material-ui/icons/Cancel';

const GaEvent = GetGaEventTrackingFunc('strategy screener');

const useStyles = makeStyles({
    root: {
        overflowX: "auto",
    },
});

export default function MainView(props) {
    const classes = useStyles();

    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        selectedExpirationTimestamps,
        expirationTimestampsOptions,
        onExpirationSelectionChange,
        deleteExpirationChip,
        onFilterChange,
        onPutToggle,
        onCallToggle,
        basicInfo,
        contracts,
        filters,
        debouncedGetContracts
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
    const [renderedContracts, setRenderedContracts] = useState([])
    const [noOfPages, setNoOfPages] = useState(null)
    const pageChangeHandler = (event, page) => {
        setRenderedContracts(contracts.slice((20 * (page - 1)), (20 * page)))
    }
    useEffect(() => {
        if (contracts) {
            setRenderedContracts(contracts.slice(0, 20))
            setNoOfPages(Math.ceil(contracts.length / 20))
        } else { setRenderedContracts([]) }
    }, [contracts])

    return (
        <>
            <Grid container minHeight="inherit">
                {!isMobile &&
                    <>
                        <Grid container item sm={2.3} direction="column" alignItems="center"
                            bgcolor='#333741' color="white" style={{ display: filterOpen ? "block" : "none" }}>
                            <ScreenFilterContainer onFilterChange={onFilterChange} filters={filters} onPutToggle={onPutToggle} onCallToggle={onCallToggle}
                                handleFilterCollapse={handleFilterCollapse} initialPrice={basicInfo.regularMarketPrice}
                                deleteExpirationChip={deleteExpirationChip} debouncedGetContracts={debouncedGetContracts} />
                        </Grid>
                        <Grid item py={2} bgcolor='#333741' color="white" style={{ display: filterOpen ? "none" : "block" }} >
                            <IconButton color="inherit" onClick={handleFilterCollapse}><TuneIcon fontSize="large" /></IconButton>
                        </Grid>
                    </>
                }
                <Grid item sm className={classes.root}>
                    <Grid component={Paper} container sm={12} elevation={4} square padding={2} style={isMobile ? { width: "100vw" } : null}>
                        {isMobile ?
                            <>
                                <Grid container>
                                    <Grid item xs>
                                        <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.shortName}` : <br />}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton color="inherit" onClick={handleMobileFilterCollapse}>
                                            <TuneIcon fontSize="large" />
                                        </IconButton>
                                    </Grid>
                                    <div style={{ position: "absolute", right: 0, top: "9vh", zIndex: 100, display: showMobileFilter ? "block" : "none" }}>
                                        <Grid container direction="column" justifyContent="center" alignItems="center" bgcolor='#333741' color="white" height="100%">
                                            <ScreenFilterContainer
                                                onFilterChange={onFilterChange}
                                                onPutToggle={onPutToggle}
                                                onCallToggle={onCallToggle}
                                                filters={filters}
                                                initialPrice={basicInfo.regularMarketPrice}
                                                isMobile={isMobile}
                                                handleMobileFilterCollapse={handleMobileFilterCollapse}
                                                allTickers={allTickers}
                                                onTickerSelectionChange={onTickerSelectionChange}
                                                selectedTicker={selectedTicker}
                                                expirationTimestampsOptions={expirationTimestampsOptions}
                                                selectedExpirationTimestamps={selectedExpirationTimestamps}
                                                onExpirationSelectionChange={onExpirationSelectionChange}
                                                deleteExpirationChip={deleteExpirationChip}
                                                debouncedGetContracts={debouncedGetContracts}
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
                                            value={selectedExpirationTimestamps}
                                            multiple
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
                                                    let sorted = selectedExpirationTimestamps.sort((a, b) => (a.value > b.value) ? 1 : -1)
                                                    return (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                                            {sorted.map((date) => (
                                                                <Chip
                                                                    key={date.value}
                                                                    label={date.label}
                                                                    clickable
                                                                    deleteIcon={
                                                                        <CancelIcon
                                                                            onMouseDown={(event) => event.stopPropagation()}
                                                                        />
                                                                    }
                                                                    onDelete={(e) => deleteExpirationChip(e, date.value)}
                                                                />
                                                            ))}
                                                        </Box>
                                                    )
                                                }
                                            }
                                        >
                                            {expirationTimestampsOptions.map((date, index) => <MenuItem value={date} key={index}> {date.label} </MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        }
                        <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                    </Grid>
                    <br />
                    <Grid container alignItems="center" pb={2} px={3}>
                        <Box p={1} border={1} borderColor="rgba(228, 228, 228, 1)" borderRadius={1} style={{ backgroundColor: "rgb(242, 246, 255)" }}>
                            Blue cards are in the money.
                        </Box>
                    </Grid>
                    <Grid container>
                        <Grid item xs={12} px={3} className={classes.root}>
                            <TableContainer component={Box} border={1} borderColor="rgba(228, 228, 228, 1)" borderRadius={1}>
                                <Table size="small">
                                    <TableHead >
                                        <TableRow style={{ position: 'sticky', top: 0, }}>
                                            <TableCell align="center"> <Typography variant="button"> TYPE </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> EXP DAY </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> STRIKE </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> LAST </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> BID/ASK</Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> VOL </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> OI </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> VOL/OI </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> IV </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> DELTA </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> GAMMA </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> THETA </Typography></TableCell>
                                            <TableCell align="center"> <Typography variant="button"> BREAKEVEN </Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {renderedContracts.map((row, index) => <ScreenRow row={row} key={index} />)}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="flex-end" alignItems="flex-end" paddingY={2}>
                        <Pagination count={noOfPages} shape="rounded" onChange={pageChangeHandler} />
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
