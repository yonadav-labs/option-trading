import React, { useState } from "react";
import { makeStyles } from '@material-ui/styles';
import {
    Alert, Grid, Typography, Paper, Divider, IconButton, useMediaQuery, FormControl, Select,
    MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Box, TableContainer, Chip,
    TablePagination, TableSortLabel, Stack
} from "@material-ui/core";
import { visuallyHidden } from '@material-ui/utils';
import CancelIcon from '@material-ui/icons/Cancel';
import TickerAutocomplete from "../../components/TickerAutocomplete";
import ScreenFilterContainer from "../../components/filters/ScreenFilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import { GetGaEventTrackingFunc } from '../../utils';
import ScreenRow from "../../components/ScreenRow";
import MetricLabel from '../../components/MetricLabel.js';
import ScreenMobileCard from "../../components/cards/ScreenMobileCard";

const GaEvent = GetGaEventTrackingFunc('option screener');

const useStyles = makeStyles({
    root: {
        overflowX: "auto",
    },
    backdropStyle: {
        position: 'fixed',
        width: '100%',
        minHeight: '100%',
        top: 0,
        left: 0,
        zIndex: '99',
        background: 'rgba(0, 0, 0, 0.5)',
    }
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
        onTextFilterChange,
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
    // mobile responsiveness
    const isCard = useMediaQuery(theme => theme.breakpoints.down('sm'));

    // mobile filter state
    const [showMobileFilter, setShowMobileFilter] = useState(true)
    const handleMobileFilterCollapse = () => {
        GaEvent('adjust mobile filter collapse');
        setShowMobileFilter(!showMobileFilter)
    }

    // pagination
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [page, setPage] = useState(0);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // sorting 
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('is_call');
    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort(array, comparator) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const headCells = [
        { id: 'is_call', label: "type" },
        { id: 'days_till_expiration', label: "exp date" },
        { id: 'strike', label: "strike" },
        { id: 'mark', label: "mark" },
        { id: 'last_price', label: "last" },
        { id: 'percent_change', label: "change" },
        { id: 'volume', label: "VOL", },
        { id: 'open_interest', label: "OI", },
        { id: 'vol_oi', label: "VOL/OI", },
        { id: 'implied_volatility', label: "IV" },
        { id: 'delta', label: "delta" },
        { id: 'gamma', label: "gamma" },
        { id: 'theta', label: "theta" },
        { id: 'itm_probability', label: "itm prob" },
        { id: 'break_even_price', label: "breakeven" },
    ];

    return (
        <Grid container minHeight="inherit">
            {!isMobile &&
                <>
                    <Grid container item sm={2.3} direction="column" alignItems="center"
                        bgcolor='#333741' color="white" style={{ display: filterOpen ? "block" : "none" }}>
                        <ScreenFilterContainer onFilterChange={onFilterChange} onTextFilterChange={onTextFilterChange} filters={filters} onPutToggle={onPutToggle} onCallToggle={onCallToggle}
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
                                <div style={{ position: "absolute", right: 0, top: "5rem", zIndex: 100, display: showMobileFilter ? "block" : "none" }}>
                                    <Grid container direction="column" justifyContent="center" alignItems="center" bgcolor='#333741' color="white" height="100%">
                                        <ScreenFilterContainer
                                            onFilterChange={onFilterChange}
                                            onTextFilterChange={onTextFilterChange}
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
                                {showMobileFilter && <div className={classes.backdropStyle} onClick={() => { setShowMobileFilter(false) }}> </div>}
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
                            <Grid item sm={4.8}>
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
                                            style: {
                                                maxHeight: "400px",
                                            },
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
                                                                    />}
                                                                onDelete={(e) => deleteExpirationChip(e, date.value)}
                                                            />
                                                        ))}
                                                    </Box>)
                                            }}
                                    >
                                        {expirationTimestampsOptions.map((date, index) => <MenuItem value={date} key={index}> {date.label} </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    }
                    <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                </Grid>
                <Grid container justifyContent="center">
                    <Box style={{ display: "inline-flex" }} p={2}>
                        {contracts.length > 0 ?
                            null
                            :
                            selectedTicker ?
                                <Alert severity="error">
                                    There are no contracts that fit the specified settings.
                                </Alert>
                                :
                                <Alert severity="error">
                                    Select a ticker and expiration date.
                                </Alert>
                        }
                    </Box>
                </Grid>
                {contracts.length > 0 ?
                    isCard ?
                        <div>
                            <Grid container justifyContent="space-between" alignItems="space-between" pb={1} px={2}>
                                <Grid xs={6}>
                                    <Box p={1} border={1} borderColor="rgba(228, 228, 228, 1)" borderRadius={1} style={{ backgroundColor: "rgb(242, 246, 255)" }}>
                                        Blue cards are in the money.
                                    </Box>
                                </Grid>
                                <TablePagination
                                    rowsPerPageOptions={[10, 20, 50, 100]}
                                    component="div"
                                    count={contracts.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    labelRowsPerPage=""
                                    labelDisplayedRows={({ from, to, count }) => null}
                                />
                            </Grid>
                            <Stack px={2} py={1}>
                                {stableSort(contracts, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        return (
                                            <ScreenMobileCard trade={row} key={index} />
                                        );
                                    })}
                            </Stack>
                        </div>
                        :
                        <div>
                            <Grid container>
                                <Grid item xs={12} px={3} className={classes.root}>
                                    <TableContainer component={Box} border={1} borderColor="rgba(228, 228, 228, 1)" borderRadius={1}>
                                        <Table size="small">
                                            <TableHead >
                                                <TableRow style={{ borderBottom: "2px solid rgba(228, 228, 228, 1)", }}>
                                                    {headCells.map((headCell) => (
                                                        <TableCell align="center" style={orderBy === headCell.id ? { backgroundColor: "orange" } : null}>
                                                            <TableSortLabel
                                                                active={orderBy === headCell.id}
                                                                direction={orderBy === headCell.id ? order : 'asc'}
                                                                onClick={createSortHandler(headCell.id)}
                                                            >
                                                                <b><MetricLabel label={headCell.label} style={{ display: "block" }} /></b>
                                                                {orderBy === headCell.id ? (
                                                                    <Box component="span" sx={visuallyHidden}>
                                                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                                    </Box>
                                                                ) : null}
                                                            </TableSortLabel>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stableSort(contracts, getComparator(order, orderBy))
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((row, index) => {
                                                        return (
                                                            <ScreenRow row={row} key={index} />
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            <Grid container justifyContent="space-between" alignItems="space-between" paddingY={2} px={3}>
                                <Box p={1} border={1} borderColor="rgba(228, 228, 228, 1)" borderRadius={1} style={{ backgroundColor: "rgb(242, 246, 255)" }}>
                                    Blue cards are in the money.
                                </Box>
                                <TablePagination
                                    rowsPerPageOptions={[10, 20, 50, 100]}
                                    component="div"
                                    count={contracts.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </Grid>
                        </div>
                    :
                    null
                }
            </Grid>
        </Grid>
    );
}
