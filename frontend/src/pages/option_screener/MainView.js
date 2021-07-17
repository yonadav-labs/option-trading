import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/styles';
import {
    Alert, Grid, Typography, Paper, Divider, IconButton, useMediaQuery,
    Table, TableHead, TableRow, TableCell, TableBody, Box, TableContainer, Chip,
    TablePagination, TableSortLabel, Stack, styled, Fab, Collapse, useTheme, Slide, Toolbar, ListSubheader, List
} from "@material-ui/core";
import { visuallyHidden } from '@material-ui/utils';
import CancelIcon from '@material-ui/icons/Cancel';
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterItems from "./FilterItems";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import { GetGaEventTrackingFunc } from '../../utils';
import ScreenRow from "../../components/ScreenRow";
import MetricLabel from '../../components/MetricLabel.js';
import ScreenMobileCard from "../../components/cards/ScreenMobileCard";
import FilterDrawer from "../../components/FilterDrawer";
import FilterDialog from "../../components/FilterDialog";
import ListItemGrid from "../../components/ListItemGrid";
import ExpirationMultiSelect from "./ExpirationMultiSelect";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const GaEvent = GetGaEventTrackingFunc('option screener');
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
    chip: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        marginRight: 2,
        color: 'white',
        "&.MuiChip-root .MuiChip-deleteIcon": {
            color: 'inherit'
        }
    },
});

export default function MainView(props) {
    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        selectedExpirationTimestamps,
        expirationTimestampsOptions,
        onExpirationSelectionChange,
        basicInfo,
        contracts,
        getContracts
    } = props
    const theme = useTheme();
    const classes = useStyles();
    const [selectedTimestamps, setSelectedTimestamps] = useState(selectedExpirationTimestamps);
    // filter states
    const [filters, setFilters] = useState({});

    // web filter slide out
    const [filterOpen, setFilterOpen] = useState(true)
    const handleFilterCollapse = () => {
        GaEvent('adjust filter collapse');
        setFilterOpen(!filterOpen)
    }

    // mobile responsiveness
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
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

    const deleteExpirationChip = (e, value) => {
        const newTimestamps = selectedTimestamps.filter(date => date.value !== value);
        setSelectedTimestamps(newTimestamps);
        onExpirationSelectionChange(newTimestamps);
    }

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

    useEffect(() => {
        if (!selectedTicker) {
            setFilters({});
        }
    }, [selectedTicker]);

    useEffect(() => {
        if (selectedTicker && selectedExpirationTimestamps) {
            getContracts(filters);
        }
        setSelectedTimestamps(selectedExpirationTimestamps);
    }, [filters, selectedExpirationTimestamps]);

    return (
        <Grid container>
            <Grid item sm>
                <Grid component={Paper} container item sm={12} elevation={4} square padding={2} style={isMobile ? { width: "100vw" } : null}>
                    {isMobile ?
                        <>
                            <Grid container>
                                <Grid item xs>
                                    <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.companyName}` : <br />}</Typography>
                                    <Typography variant="body2">
                                        {selectedExpirationTimestamps.length > 0 ?
                                            selectedExpirationTimestamps.map(ts => {
                                                return (<Chip
                                                    key={ts.value}
                                                    label={ts.label}
                                                    className={classes.chip}
                                                    size="small"
                                                    clickable
                                                    deleteIcon={
                                                        <CancelIcon
                                                            onMouseDown={(event) => event.stopPropagation()}
                                                        />}
                                                    onDelete={(e) => deleteExpirationChip(e, ts.value)}
                                                />)
                                            })
                                            : <br />}
                                    </Typography>
                                </Grid>
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
                                <ExpirationMultiSelect
                                    selectedTimestamps={selectedTimestamps}
                                    setSelectedTimestamps={setSelectedTimestamps}
                                    onExpirationSelectionChange={onExpirationSelectionChange}
                                    deleteExpirationChip={deleteExpirationChip}
                                    expirationTimestampsOptions={expirationTimestampsOptions}
                                    variant="standard"
                                />
                            </Grid>
                        </Grid>
                    }
                    <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                </Grid>
                <Grid container item sx={{ minHeight: "80vh" }}>
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
                            <Typography variant="button" gutterBottom><MetricLabel label="expiration date" /></Typography>
                            <ExpirationMultiSelect
                                selectedTimestamps={selectedTimestamps}
                                setSelectedTimestamps={setSelectedTimestamps}
                                onExpirationSelectionChange={onExpirationSelectionChange}
                                deleteExpirationChip={deleteExpirationChip}
                                expirationTimestampsOptions={expirationTimestampsOptions}
                                variant="outlined"
                            />
                        </ListItemGrid>
                        <FilterItems
                            filters={filters}
                            setFilters={setFilters}
                            basicInfo={basicInfo}
                        />
                    </FilterDialog>
                    <Grid container xs>
                        <FilterDrawer open={!isMobile && filterOpen}>
                            <FilterItems
                                filters={filters}
                                setFilters={setFilters}
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
                        <Grid container item justifyContent={isMobile ? "center" : "space-between"} p={1} spacing={1}>
                            <Grid container item xs={isMobile ? 12 : 4} alignItems="center" justifyContent={isMobile ? "center" : "flex-start"}>
                                {!filterOpen &&
                                    (!isMobile ?
                                        <Grid item>
                                            <IconButton color="inherit" onClick={handleFilterCollapse}><TuneIcon fontSize="large" /></IconButton>
                                        </Grid>
                                        :
                                        <Fab onClick={handleFilterCollapse} variant="extended" size="small" color="primary" aria-label="filters" sx={{ position: 'fixed', top: 'auto', left: '50%', right: 'auto', bottom: 8, transform: 'translateX(-50%)' }}>
                                            Filters
                                        </Fab>
                                    )
                                }
                                <Grid item>
                                    <Alert severity="info">Blue contracts are in the money.</Alert>
                                </Grid>
                            </Grid>
                            {contracts.length > 0 ?
                                null
                                :
                                selectedTicker ?
                                    <Grid item>
                                        <Alert severity="error">There are no contracts that fit the specified settings.</Alert>
                                    </Grid>
                                    :
                                    <Grid item>
                                        <Alert severity="error">Select a ticker and expiration date.</Alert>
                                    </Grid>
                            }
                        </Grid>
                        {contracts.length > 0 ?
                            isCard ?
                                <>
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
                                        sx={{ width: '100%' }}
                                    />
                                    <Stack px={2} py={1} sx={{ width: '100%' }}>
                                        {stableSort(contracts, getComparator(order, orderBy))
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row, index) => {
                                                return (
                                                    <ScreenMobileCard trade={row} key={index} />
                                                );
                                            })}
                                    </Stack>
                                </>
                                :
                                <>
                                    <TableContainer>
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
                                    <Grid container justifyContent="flex-end" alignItems="center" paddingY={2} px={1}>
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
                                </>
                            :
                            null
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
