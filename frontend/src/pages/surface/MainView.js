import React, { useState } from "react";
import { makeStyles } from '@material-ui/styles';
import {
    Grid, Typography, Paper, Divider, IconButton, useMediaQuery, FormControl, Select, MenuItem
} from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import SurfaceFilterContainer from "../../components/filters/SurfaceFilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";
import TuneIcon from "@material-ui/icons/Tune";
import { GetGaEventTrackingFunc } from '../../utils';
import HeatMapTable from '../../components/HeatMapTable';

const GaEvent = GetGaEventTrackingFunc('surface');

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
        expirationTimestampsOptions,
        onFilterChange,
        basicInfo,
        filters,
        contractTypeOptions,
        targetOptions,
        baseHeatmapData
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

    return (
        <Grid container minHeight="inherit">
            {!isMobile &&
                <>
                    <Grid container item sm={2.3} direction="column" alignItems="center"
                        bgcolor='#333741' color="white" style={{ display: filterOpen ? "block" : "none" }}>
                        <SurfaceFilterContainer
                            onFilterChange={onFilterChange}
                            expirationTimestampsOptions={expirationTimestampsOptions}
                            handleFilterCollapse={handleFilterCollapse}
                            initialPrice={basicInfo.regularMarketPrice}
                        />
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
                                        <SurfaceFilterContainer
                                            onFilterChange={onFilterChange}
                                            initialPrice={basicInfo.regularMarketPrice}
                                            isMobile={isMobile}
                                            handleMobileFilterCollapse={handleMobileFilterCollapse}
                                            allTickers={allTickers}
                                            onTickerSelectionChange={onTickerSelectionChange}
                                            selectedTicker={selectedTicker}
                                            expirationTimestampsOptions={expirationTimestampsOptions}
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
                                <Typography variant="subtitle1">Type</Typography>
                            </Grid>
                            <Grid item sm>
                                <FormControl fullWidth>
                                    <Select
                                        id="contract-type"
                                        fullWidth
                                        defaultValue={filters.contractType}
                                        onChange={(e) => onFilterChange(e.target.value, 'contractType')}
                                        style={{ paddingLeft: 15 }}
                                        variant="standard"
                                    >
                                        {contractTypeOptions.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle1">Metric</Typography>
                            </Grid>
                            <Grid item sm>
                                <Select
                                    id="metric"
                                    defaultValue={filters.metric}
                                    fullWidth
                                    onChange={(e) => onFilterChange(e.target.value, 'metric')}
                                    style={{ paddingLeft: 15 }}
                                    variant="standard"
                                >
                                    {targetOptions.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)}
                                    {filters.contractType == 'call' ?
                                        <MenuItem value={"apr"} key={4}> Annualized Covered Call Premium Profit if OTM </MenuItem>
                                        :
                                        <MenuItem value={"apr"} key={4}> Annualized Cash Secured Put Premium Profit if OTM </MenuItem>
                                    }
                                </Select>
                            </Grid>

                        </Grid>
                    }
                    <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                </Grid>
                <Grid container>
                    <Grid item xs={12} px={3} className={classes.root}>
                        <HeatMapTable
                            className="my-4"
                            zLabel={filters.metric}
                            data={baseHeatmapData}
                            contractType={filters.contractType}
                            stockPrice={basicInfo.regularMarketPrice}
                        />
                    </Grid>
                </Grid>

            </Grid>
        </Grid>
    );
}
