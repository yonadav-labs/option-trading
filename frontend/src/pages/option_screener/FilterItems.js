import React, { useEffect, useState } from "react";
import {
    Grid, Typography, Button, ToggleButton, ToggleButtonGroup,
    List, styled, Divider, ListSubheader
} from "@material-ui/core";
import MaterialFilter from "../../components/filters/MaterialFilter";
import MetricLabel from "../../components/MetricLabel";
import { GetGaEventTrackingFunc } from '../../utils';
import RangeSlider from "../../components/filters/RangeSlider";
import { isEmpty } from "lodash";
import ListItemGroup from "../../components/ListItemGroup";
import ListItemGrid from "../../components/ListItemGrid";
import PropTypes from "prop-types";

const GaEvent = GetGaEventTrackingFunc('option screener');
const GroupDivider = styled(Divider)(({ theme }) => ({
    borderColor: '#FFFFFF',
    opacity: 0.25
}));

export default function FilterItems(props) {
    const {
        filters,
        setFilters,
        basicInfo,
        subHeader,
    } = props;
    const maxStrikeValue = Math.round(Number(basicInfo.latestPrice) * 3 * 1e2) / 1e2;
    const [strikeRange, setStrikeRange] = useState([0, isEmpty(basicInfo) ? 0 : maxStrikeValue]);
    const [minVol, setMinVol] = useState(0);
    const [minOI, setMinOI] = useState(0);
    const [itmRange, setITMRange] = useState([0, 100]);
    const [minLastTraded, setMinLastTraded] = useState(0);
    const [baRange, setBARange] = useState([0, 100]);
    const [deltaRange, setDeltaRange] = useState([-1, 1]);
    const [gammaRange, setGammaRange] = useState([0, 1]);
    const [thetaRange, setThetaRange] = useState([-1, 0]);
    const [vegaRange, setVegaRange] = useState([0, 1]);
    const [ivRange, setIVRange] = useState([0, 999]);
    // const [intrinsicValRange, setIntrinsicValRange] = useState([0, 100]);
    // const [extrinsicValRange, setExtrinsicValRange] = useState([0, 100]);
    const [optionTypes, setOptionTypes] = useState(['call', 'put']);
    const [filtersAdjusted, setFiltersAdjusted] = useState(false);
    const [previousFilters, setPreviousFilters] = useState(filters);

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
        maxStrikeValue
    ];

    const updateFilterValue = (props, func) => {
        setFiltersAdjusted(true);
        func(props);
    }

    const strikeRenderOption = (props, option) =>
        <li {...props} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>${option}</span>
            <span style={{ color: "#8f8f8f" }}>
                {option > basicInfo.latestPrice && "+"}{Number(((option - basicInfo.latestPrice) / basicInfo.latestPrice) * 100).toFixed(0)}%
            </span>
        </li>

    const handleTypeChange = (newTypes) => {
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
            addOrRemoveFilter(copy, "max.strike", strikeRange[1], maxStrikeValue);
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
        setFiltersAdjusted(false);
    }

    const setDefaultStates = (filters) => {
        setStrikeRange([filters["min.strike"] || 0, filters["max.strike"] || (isEmpty(basicInfo) ? 0 : maxStrikeValue)]);
        setMinVol(filters["min.volume"] || 0);
        setMinOI(filters["min.open_interest"] || 0);
        setITMRange([filters["min.itm_probability"] || 0, filters["max.itm_probability"] || 100]);
        setMinLastTraded(filters["min.last_trade_date"] ? Math.round((Date.now() - filters["min.last_trade_date"] * 1000) / -(24 * 60 * 60 * 1000)) : 0);
        setBARange([filters["min.bid_ask_spread"] || 0, filters["max.bid_ask_spread"] || 100]);
        setDeltaRange([filters["min.delta"] || -1, filters["max.delta"] || 1]);
        setGammaRange([filters["min.gamma"] || 0, filters["max.gamma"] || 1]);
        setThetaRange([filters["min.theta"] || -1, filters["max.theta"] || 0]);
        setVegaRange([filters["min.vega"] || 0, filters["max.vega"] || 1]);
        setIVRange([filters["min.implied_volatility"] || 0, filters["max.implied_volatility"] || 999]);
        setOptionTypes(filters.hasOwnProperty("eq.is_call") ? filters["eq.is_call"] ? ['call'] : ['put'] : ['call', 'put']);
    }

    const cancelFilterChanges = () => {
        setFilters(previousFilters);
        setDefaultStates(previousFilters);
        setFiltersAdjusted(false);
    }

    const clearAllFilters = () => {
        setFilters({});
    }

    const countFiltersFromGroup = (filterKeys) => {
        // can use following to do exact match if that is better?
        // return filterKeys.reduce((a, c) => a + Object.keys(filters).includes(c), 0);
        return Object.keys(filters).reduce((a, c) => a + filterKeys.some(k => c.includes(k)), 0);
    }

    useEffect(() => {
        setPreviousFilters(filters);
        setDefaultStates(filters);
    }, [basicInfo, filters]);

    return (
        <>
            <List>
                <ListSubheader sx={{ backgroundColor: '#333741', zIndex: 2 }} disableGutters>
                    {subHeader}
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ p: 2 }} columnSpacing={1}>
                        {filtersAdjusted ?
                            <>
                                <Grid item xs={6}><Button variant="contained" color="secondary" size="large" fullWidth onClick={cancelFilterChanges}>Cancel</Button></Grid>
                                <Grid item xs={6}><Button variant="contained" color="primary" size="large" fullWidth onClick={applyFilters}>Apply</Button></Grid>
                            </>
                            :
                            <>
                                <Grid item xs={6}><Typography variant="h6" color="white">{Object.keys(filters).length} Filters</Typography></Grid>
                                <Grid item xs={6}><Button variant="text" size="large" fullWidth onClick={clearAllFilters}>Reset</Button></Grid>
                            </>
                        }
                    </Grid>
                </ListSubheader>
                <GroupDivider />
                <ListItemGrid>
                    <Typography variant="button" gutterBottom><MetricLabel label="type" /></Typography>
                    <ToggleButtonGroup
                        fullWidth
                        size="large"
                        value={optionTypes}
                        onChange={(e, v) => { updateFilterValue(v, handleTypeChange) }}
                        aria-label="option-contract-type"
                    >
                        <ToggleButton color="secondary" value="call" aria-label="call">
                            Call
                        </ToggleButton>
                        <ToggleButton color="secondary" value="put" aria-label="put">
                            Put
                        </ToggleButton>
                    </ToggleButtonGroup>
                </ListItemGrid>
                <ListItemGrid>
                    <RangeSlider
                        range={strikeRange}
                        setRange={val => { updateFilterValue(val, setStrikeRange) }}
                        id="strike"
                        label="Strike"
                        valueText={(value) => value}
                        startAdornment="$"
                        max={isEmpty(basicInfo) ? 0 : maxStrikeValue}
                        step={0.01}
                        minOptions={minStrikeOptions}
                        maxOptions={maxStrikeOptions}
                        minRenderOption={strikeRenderOption}
                        maxRenderOption={strikeRenderOption}
                    />
                </ListItemGrid>
                <GroupDivider />
                <ListItemGroup groupName="Liquidity" defaultOpen={true} badgeContent={countFiltersFromGroup(['min.volume', 'min.open_interest', 'min.last_trade_date', 'bid_ask_spread'])}>
                    <ListItemGrid>
                        <Typography variant="button" gutterBottom><MetricLabel label="min volume" /></Typography>
                        <MaterialFilter
                            onFilterChange={(e) => { updateFilterValue(e.target.value, setMinVol) }}
                            options={minVolumeFilterOptions}
                            value={minVol}
                            defaultValue={0}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <Typography variant="button" gutterBottom><MetricLabel label="min open interest" /></Typography>
                        <MaterialFilter
                            onFilterChange={(e) => { updateFilterValue(e.target.value, setMinOI) }}
                            options={minInterestFilterOptions}
                            value={minOI}
                            defaultValue={0}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <Typography variant="button" gutterBottom><MetricLabel label="time since last traded" /></Typography>
                        <MaterialFilter
                            onFilterChange={(e) => { updateFilterValue(e.target.value, setMinLastTraded) }}
                            options={lastTradedFilterOptions}
                            value={minLastTraded}
                            defaultValue={0}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <RangeSlider
                            range={baRange}
                            setRange={val => { updateFilterValue(val, setBARange) }}
                            id="ba"
                            label="Bid/Ask Spread"
                            valueText={(value) => `$${value}`}
                            startAdornment="$"
                            step={0.01}
                        />
                    </ListItemGrid>
                </ListItemGroup>
                <GroupDivider />
                <ListItemGrid>
                    <RangeSlider
                        range={ivRange}
                        setRange={val => { updateFilterValue(val, setIVRange) }}
                        id="iv"
                        label="Implied Volatility"
                        valueText={(value) => `${value}%`}
                        endAdornment="%"
                        min={0}
                        max={999}
                    />
                </ListItemGrid>
                <ListItemGrid>
                    <RangeSlider
                        range={itmRange}
                        setRange={val => { updateFilterValue(val, setITMRange) }}
                        id="minITM"
                        label="Min In The Money(ITM) Probability"
                        valueText={(value) => value}
                        endAdornment="%"
                    />
                </ListItemGrid>
                <GroupDivider />
                <ListItemGroup groupName="Greeks" defaultOpen={true} badgeContent={countFiltersFromGroup(['delta', 'gamma', 'theta', 'vega'])}>
                    <ListItemGrid>
                        <RangeSlider
                            range={deltaRange}
                            setRange={val => { updateFilterValue(val, setDeltaRange) }}
                            id="delta"
                            label="Delta"
                            valueText={(value) => value}
                            min={-1}
                            max={1}
                            step={0.01}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <RangeSlider
                            range={gammaRange}
                            setRange={val => { updateFilterValue(val, setGammaRange) }}
                            id="gamma"
                            label="Gamma"
                            valueText={(value) => value}
                            max={1}
                            step={0.01}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <RangeSlider
                            range={thetaRange}
                            setRange={val => { updateFilterValue(val, setThetaRange) }}
                            id="theta"
                            label="Theta"
                            valueText={(value) => value}
                            min={-1}
                            max={0}
                            step={0.01}
                        />
                    </ListItemGrid>
                    <ListItemGrid>
                        <RangeSlider
                            range={vegaRange}
                            setRange={val => { updateFilterValue(val, setVegaRange) }}
                            id="vega"
                            label="Vega"
                            valueText={(value) => value}
                            max={1}
                            step={0.01}
                        />
                    </ListItemGrid>
                </ListItemGroup>
                <GroupDivider />
            </List>
        </>
    );
}

FilterItems.defaultProps = {
    subHeader: null,
};

FilterItems.propTypes = {
    filters: PropTypes.object.isRequired,
    setFilters: PropTypes.func.isRequired,
    basicInfo: PropTypes.object.isRequired,
    subHeader: PropTypes.node
};