import React, { useEffect, useState } from "react";
import { Grid, Box, IconButton, Typography, FormControl, Select, MenuItem, Button, Chip, ToggleButton, ToggleButtonGroup } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@material-ui/icons/Cancel';
import MaterialFilter from "../../components/filters/MaterialFilter";
import MetricLabel from "../../components/MetricLabel";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import { GetGaEventTrackingFunc } from '../../utils';
import RangeSlider from "../../components/filters/RangeSlider";
import { makeStyles } from "@material-ui/styles";
import { isEmpty, set } from "lodash";

const GaEvent = GetGaEventTrackingFunc('option screener');
const useStyles = makeStyles(theme => ({
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
    chip: {
        backgroundColor: "#FFF",
        marginRight: 2,
    },
    spinnerless: {
        "&.MuiInput-root input[type=number]": {
            '-moz-appearance': 'textfield',
        },
        '&.MuiInput-root input::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
        '&.MuiInput-root input::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
    },
    customInput: {
        background: 'rgba(255, 255, 255, 0.15)',
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: 0
        },
        "& input[type=number]": {
            "-moz-appearance": "textfield"
        }
    },
    colorWhite: {
        color: 'white'
    }
}))

export default function FilterMenu(props) {
    const {
        filters,
        setFilters,
        basicInfo,
        handleFilterCollapse,
        isMobile,
        handleMobileFilterCollapse,
        allTickers,
        onTickerSelectionChange,
        selectedTicker,
        expirationTimestampsOptions,
        selectedExpirationTimestamps,
        onExpirationSelectionChange,
        debouncedGetContracts,
        deleteExpirationChip,
    } = props
    const classes = useStyles();
    const [strikeRange, setStrikeRange] = useState([0, isEmpty(basicInfo) ? 0 : Number(basicInfo.latestPrice * 3).toFixed(2)]);
    const [minVol, setMinVol] = useState(0);
    const [minOI, setMinOI] = useState(0);
    const [itmRange, setITMRange] = useState([0, 100]);
    const [minLastTraded, setMinLastTraded] = useState(0);
    const [baRange, setBARange] = useState([0, 100]);
    const [deltaRange, setDeltaRange] = useState([-1, 1]);
    const [gammaRange, setGammaRange] = useState([0, 1]);
    const [thetaRange, setThetaRange] = useState([-1, 0]);
    const [vegaRange, setVegaRange] = useState([0, 1]);
    const [rhoRange, setRhoRange] = useState([-1, 1]);
    const [ivRange, setIVRange] = useState([0, 999]);
    // const [intrinsicValRange, setIntrinsicValRange] = useState([0, 100]);
    // const [extrinsicValRange, setExtrinsicValRange] = useState([0, 100]);
    const [optionTypes, setOptionTypes] = useState(['call', 'put']);

    const minVolumeFilterOptions = [
        { label: "All", value: 0 },
        { label: "≥ 1", value: 1 },
        { label: "≥ 5", value: 5 },
        { label: "≥ 10", value: 10 },
        { label: "≥ 50", value: 50 },
        { label: "≥ 100", value: 100 },
        { label: "≥ 500", value: 500 },
        { label: "≥ 1000", value: 1000 },
        { label: "≥ 5000", value: 5000 },
    ];

    const minInterestFilterOptions = [
        { label: "All", value: 0 },
        { label: "≥ 1", value: 1 },
        { label: "≥ 5", value: 5 },
        { label: "≥ 10", value: 10 },
        { label: "≥ 50", value: 50 },
        { label: "≥ 100", value: 100 },
        { label: "≥ 500", value: 500 },
        { label: "≥ 1000", value: 1000 },
        { label: "≥ 5000", value: 5000 },
    ];

    const lastTradedFilterOptions = [
        { label: "All", value: 0 },
        { label: "Past 1 Day", value: 1 },
        { label: "Past 5 Days", value: 5 },
        { label: "Past 10 Days", value: 10 },
        { label: "Past 30 Days", value: 30 },
    ];

    const minStrikeOptions = [
        0,
        Number(basicInfo.latestPrice * 0.25).toFixed(2),
        Number(basicInfo.latestPrice * 0.5).toFixed(2),
        Number(basicInfo.latestPrice * 0.75).toFixed(2),
        Number(basicInfo.latestPrice).toFixed(2)
    ];

    const maxStrikeOptions = [
        Number(basicInfo.latestPrice).toFixed(2),
        Number(basicInfo.latestPrice * 1.25).toFixed(2),
        Number(basicInfo.latestPrice * 1.5).toFixed(2),
        Number(basicInfo.latestPrice * 1.75).toFixed(2),
        Number(basicInfo.latestPrice * 3).toFixed(2)
    ];

    const strikeRenderOption = (props, option) =>
        <li {...props} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>${option}</span>
            <span style={{ color: "#8f8f8f" }}>
                {option > basicInfo.latestPrice && "+"}{Number(((option - basicInfo.latestPrice) / basicInfo.latestPrice) * 100).toFixed(0)}%
            </span>
        </li>

    const handleTypeChange = (event, newTypes) => {
        if (newTypes.length) {
            setOptionTypes(newTypes);
            GaEvent('adjust filter option type');
        }
    }

    const addOrRemoveFilter = (filters, key, val, defaultVal = null) => {
        if (val && val !== defaultVal) {
            filters[key] = val;
            GaEvent('adjust filter ' + key);
        } else {
            delete filters[key];
        }
    }

    const applyFilters = () => {
        setFilters(prevState => {
            let copy = { ...prevState };

            // option type
            if (optionTypes.length == 1) {
                copy["eq.is_call"] = optionTypes.includes("call");
            } else {
                delete copy["eq.is_call"];
            }
            // strike
            addOrRemoveFilter(copy, "min.strike", strikeRange[0]);
            addOrRemoveFilter(copy, "max.strike", strikeRange[1], basicInfo.latestPrice * 3);
            // volume
            addOrRemoveFilter(copy, "min.volume", minVol);
            // open interest
            addOrRemoveFilter(copy, "min.open_interest", minOI);
            // itm probablitiy
            addOrRemoveFilter(copy, "min.itm_probability", itmRange[0] / 100);
            addOrRemoveFilter(copy, "max.itm_probability", itmRange[1] / 100, 1);
            // last traded
            if (minLastTraded) {
                copy["min.last_trade_date"] = new Date(Date.now() - (minLastTraded * 24 * 60 * 60 * 1000)).getTime() / 1000;
            } else {
                delete copy["min.last_trade_date"]
            }
            // bid/ask spread
            addOrRemoveFilter(copy, "min.bid_ask_spread", baRange[0]);
            addOrRemoveFilter(copy, "max.bid_ask_spread", baRange[1], 100);
            // delta
            addOrRemoveFilter(copy, "min.delta", deltaRange[0], -1);
            addOrRemoveFilter(copy, "max.delta", deltaRange[1], 1);
            // gamma
            addOrRemoveFilter(copy, "min.gamma", gammaRange[0]);
            addOrRemoveFilter(copy, "max.gamma", gammaRange[1], 1);
            // theta
            addOrRemoveFilter(copy, "min.theta", thetaRange[0], -1);
            addOrRemoveFilter(copy, "max.theta", thetaRange[1], 0);
            // vega
            addOrRemoveFilter(copy, "min.vega", vegaRange[0]);
            addOrRemoveFilter(copy, "max.vega", vegaRange[1], 1);
            // rho
            addOrRemoveFilter(copy, "min.rho", rhoRange[0], -1);
            addOrRemoveFilter(copy, "max.rho", rhoRange[1], 1);
            // iv
            addOrRemoveFilter(copy, "min.implied_volatility", ivRange[0], 0);
            addOrRemoveFilter(copy, "max.implied_volatility", ivRange[1], 999);
            // intrinsic value*
            // copy["min.intrinsic_value"] = intrinsicValRange[0];
            // copy["max.intrinsic_value"] = intrinsicValRange[1];
            // extrinsic value*
            // copy["min.extrinsic_value"] = extrinsicValRange[0];
            // copy["max.extrinsic_value"] = extrinsicValRange[1];

            return copy;
        });
    }

    useEffect(() => {
        if (isEmpty(filters)) {
            setStrikeRange([0, isEmpty(basicInfo) ? 0 : basicInfo.latestPrice * 3]);
            setMinVol(0);
            setMinOI(0);
            setITMRange([0, 100]);
            setMinLastTraded(0);
            setBARange([0, 100]);
            setDeltaRange([-1, 1]);
            setGammaRange([0, 1]);
            setThetaRange([-1, 0]);
            setVegaRange([0, 1]);
            setRhoRange([-1, 1]);
            setIVRange([0, 999]);
            setOptionTypes(['call', 'put']);
        }
    }, [basicInfo, filters]);

    return (
        <div style={{ paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "1rem", width: "100%" }} >
            <Grid container item direction="row" justifyContent="space-between" alignItems="center">
                <Grid item><Typography variant="h5">Filters</Typography></Grid>
                <Grid item>
                    {isMobile ?
                        <IconButton color="inherit" style={{ height: "max-content" }} onClick={handleMobileFilterCollapse}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                        :
                        <IconButton color="inherit" style={{ height: "max-content" }} onClick={handleFilterCollapse}>
                            <TuneIcon fontSize="large" />
                        </IconButton>}
                </Grid>
            </Grid>
            {isMobile ?
                <Box paddingY="0.5rem">
                    <Box py={0.5}>
                        <Grid item paddingBottom='0.1rem'>
                            <Typography variant="button"><MetricLabel label="ticker symbol" /></Typography>
                        </Grid>
                        <Grid>
                            <TickerAutocomplete
                                tickers={allTickers}
                                onChange={onTickerSelectionChange}
                                size={'medium'}
                                value={selectedTicker}
                                variant="outlined"
                                className={classes.autocomplete}
                            />
                        </Grid>
                    </Box>
                    <Box py={0.5}>
                        <Grid item paddingBottom='0.1rem'>
                            <Typography variant="button"><MetricLabel label="expiration date" /></Typography>
                        </Grid>
                        <Grid>
                            <FormControl fullWidth>
                                <Select
                                    id="expiration-dates"
                                    value={selectedExpirationTimestamps}
                                    fullWidth
                                    placeholder="Select an expiration date"
                                    onChange={(e) => onExpirationSelectionChange(e.target.value)}
                                    onClose={debouncedGetContracts}
                                    variant="outlined"
                                    className={classes.select}
                                    MenuProps={{
                                        style: {
                                            maxHeight: "300px",
                                        },
                                        anchorOrigin: {
                                            vertical: "bottom",
                                            horizontal: "center"
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
                                                            className={classes.chip}
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
                                    {expirationTimestampsOptions.map((date, index) => <MenuItem value={date.value} key={index}> {date.label} </MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Box>
                </Box>
                :
                null
            }
            <Box paddingTop="0.5rem">
                <Grid item paddingBottom='0.4rem'>
                    <Button variant="contained" color="primary" size="large" fullWidth onClick={applyFilters}>Apply Filters</Button>
                </Grid>
            </Box>
            <Box paddingTop="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="type" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <ToggleButtonGroup
                        fullWidth
                        size="large"
                        value={optionTypes}
                        onChange={handleTypeChange}
                        aria-label="option-contract-type"
                    >
                        <ToggleButton color="secondary" value="call" aria-label="call">
                            Call
                        </ToggleButton>
                        <ToggleButton color="secondary" value="put" aria-label="put">
                            Put
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={strikeRange}
                    setRange={val => { setStrikeRange(val) }}
                    id="strike"
                    label="Strike"
                    valueText={(value) => value}
                    startAdornment="$"
                    max={isEmpty(basicInfo) ? 0 : Number(basicInfo.latestPrice * 3).toFixed(2)}
                    step={0.01}
                    minOptions={minStrikeOptions}
                    maxOptions={maxStrikeOptions}
                    minRenderOption={strikeRenderOption}
                    maxRenderOption={strikeRenderOption}
                />
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min volume" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter
                        onFilterChange={(e) => { setMinVol(e.target.value) }}
                        options={minVolumeFilterOptions}
                        value={minVol}
                        defaultValue={0}
                    />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="min open interest" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter
                        onFilterChange={(event) => { setMinOI(event.target.value) }}
                        options={minInterestFilterOptions}
                        value={minOI}
                        defaultValue={0}
                    />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={ivRange}
                    setRange={val => { setIVRange(val) }}
                    id="iv"
                    label="Implied Volatility"
                    valueText={(value) => `${value}%`}
                    endAdornment="%"
                    min={0}
                    max={999}
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={itmRange}
                    setRange={val => { setITMRange(val) }}
                    id="minITM"
                    label="Min In The Money(ITM) Probability"
                    valueText={(value) => value}
                    endAdornment="%"
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={deltaRange}
                    setRange={val => { setDeltaRange(val) }}
                    id="delta"
                    label="Delta"
                    valueText={(value) => value}
                    min={-1}
                    max={1}
                    step={0.01}
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={gammaRange}
                    setRange={val => { setGammaRange(val) }}
                    id="gamma"
                    label="Gamma"
                    valueText={(value) => value}
                    max={1}
                    step={0.01}
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={thetaRange}
                    setRange={val => { setThetaRange(val) }}
                    id="theta"
                    label="Theta"
                    valueText={(value) => value}
                    min={-1}
                    max={0}
                    step={0.01}
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={vegaRange}
                    setRange={val => { setVegaRange(val) }}
                    id="vega"
                    label="Vega"
                    valueText={(value) => value}
                    max={1}
                    step={0.01}
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={rhoRange}
                    setRange={val => { setRhoRange(val) }}
                    id="rho"
                    label="Rho"
                    valueText={(value) => value}
                    min={-1}
                    max={1}
                    step={0.01}
                />
            </Box>
            <Box paddingY="0.5rem">
                <Grid item paddingBottom='0.1rem'>
                    <Typography variant="button"><MetricLabel label="time since last traded" /></Typography>
                </Grid>
                <Grid item paddingBottom='0.4rem'>
                    <MaterialFilter
                        onFilterChange={(event) => { setMinLastTraded(event.target.value) }}
                        options={lastTradedFilterOptions}
                        value={minLastTraded}
                        defaultValue={0}
                    />
                </Grid>
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={baRange}
                    setRange={val => { setBARange(val) }}
                    id="ba"
                    label="Bid/Ask Spread"
                    valueText={(value) => `$${value}`}
                    startAdornment="$"
                    step={0.01}
                />
            </Box>
            {/* <Box paddingY="0.5rem">
                <RangeSlider
                    range={intrinsicValRange}
                    setRange={setIntrinsicValRange}
                    id="intrinsic"
                    label="Intrinsic Value"
                    valueText={(value) => `$${value}`}
                    startAdornment="$"
                />
            </Box>
            <Box paddingY="0.5rem">
                <RangeSlider
                    range={extrinsicValRange}
                    setRange={setExtrinsicValRange}
                    id="exitrinsic"
                    label="Extrinsic Value"
                    valueText={(value) => `$${value}`}
                    startAdornment="$"
                />
            </Box> */}
            <Box paddingTop="0.5rem">
                <Grid item paddingBottom='0.4rem'>
                    <Button variant="contained" color="primary" size="large" fullWidth onClick={applyFilters}>Apply Filters</Button>
                </Grid>
            </Box>
        </div>
    );
}
