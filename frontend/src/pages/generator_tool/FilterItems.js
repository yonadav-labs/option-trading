import React, { useContext, useEffect, useState } from "react";
import {
    Grid, Typography, Button, List, styled, Divider, ListSubheader
} from "@material-ui/core";
import MaterialFilter from "../../components/filters/MaterialFilter";
import MetricLabel from "../../components/MetricLabel";
import { fixedFloat, GetGaEventTrackingFunc } from '../../utils';
import RangeSlider from "../../components/filters/RangeSlider";
import { isEmpty } from "lodash";
import ListItemGroup from "../../components/ListItemGroup";
import ListItemGrid from "../../components/ListItemGrid";
import PropTypes from "prop-types";
import PriceTargetBox from "../../components/filters/PriceTargetBox";
import UserContext from "../../UserContext";
import DollarInputField from "../../components/filters/DollarInputField";

const GaEvent = GetGaEventTrackingFunc('strategy screener');
const GroupDivider = styled(Divider)(({ theme }) => ({
    borderColor: '#FFFFFF',
    opacity: 0.25
}));

export default function FilterItems(props) {
    const {
        strategySettings,
        contractFilters,
        tradeFilters,
        setStrategySettings,
        setContractFilters,
        setTradeFilters,
        basicInfo,
        subHeader,
    } = props;

    const { user } = useContext(UserContext);

    const [filtersAdjusted, setFiltersAdjusted] = useState(false);
    const [previousStrategySettings, setPreviousStrategySettings] = useState(strategySettings);
    const [previousContractFilters, setPreviousContractFilters] = useState(contractFilters);
    const [previousTradeFilters, setPreviousTradeFilters] = useState(tradeFilters);

    const [targetPrice, setTargetPrice] = useState([(isEmpty(basicInfo) ? 0 : fixedFloat(basicInfo.latestPrice)), (isEmpty(basicInfo) ? 0 : fixedFloat(basicInfo.latestPrice))]);
    const [profitRatio, setProfitRatio] = useState(0);
    const [profitProb, setProfitProb] = useState(0);
    const [premiumType, setPremiumType] = useState("market");
    const [cashToInvest, setCashToInvest] = useState(0);
    const [minVol, setMinVol] = useState(0);
    const [minOI, setMinOI] = useState(0);
    const [minLastTraded, setMinLastTraded] = useState(0);
    const [baRange, setBARange] = useState([0, 100]);

    const premiumPriceFilterOptions = [
        { label: "Market Order Price", value: "market" },
        { label: "Mid/Mark Price", value: 'mid' }
    ];

    const minTargetPriceProfitRatio = [
        { label: "All", value: 0.0 },
        { label: "≥ 1%", value: 0.01 },
        { label: "≥ 2%", value: 0.02 },
        { label: "≥ 5%", value: 0.05 },
        { label: "≥ 10%", value: 0.1 },
        { label: "≥ 20%", value: 0.2 },
        { label: "≥ 50%", value: 0.5 },
        { label: "≥ 100%", value: 1 },
        { label: "≥ 200%", value: 2 },
        { label: "≥ 500%", value: 5 },
    ];

    const minProfitProbOptions = [
        { label: "All", value: 0.0 },
        { label: "≥ 5%", value: 0.05 },
        { label: "≥ 10%", value: 0.1 },
        { label: "≥ 20%", value: 0.2 },
        { label: "≥ 30%", value: 0.3 },
        { label: "≥ 40%", value: 0.4 },
        { label: "≥ 50%", value: 0.5 },
        { label: "≥ 60%", value: 0.6 },
        { label: "≥ 70%", value: 0.7 },
        { label: "≥ 80%", value: 0.8 },
        { label: "≥ 90%", value: 0.9 },
    ];

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

    const updateFilterValue = (props, func) => {
        setFiltersAdjusted(true);
        func(props);
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
        setStrategySettings(prevState => {
            let copy = { ...prevState };

            // premium type
            addOrRemoveFilter(copy, 'premium_type', premiumType, 'market');
            // target price
            addOrRemoveFilter(copy, 'target_price_lower', targetPrice[0]);
            addOrRemoveFilter(copy, 'target_price_upper', targetPrice[1]);
            // cash to invest
            addOrRemoveFilter(copy, 'cash_to_invest', cashToInvest);

            return copy;
        });
        setContractFilters(prevState => {
            let copy = { ...prevState };

            // open interest
            addOrRemoveFilter(copy, 'min.open_interest', minOI);
            // volume
            addOrRemoveFilter(copy, 'min.volume', minVol);
            // last traded
            if (minLastTraded) {
                copy["min.last_trade_date"] = new Date(Date.now() - (minLastTraded * 24 * 60 * 60 * 1000)).getTime() / 1000;
            } else {
                delete copy["min.last_trade_date"]
            }
            // bid/ask spread
            addOrRemoveFilter(copy, "min.bid_ask_spread", baRange[0]);
            addOrRemoveFilter(copy, "max.bid_ask_spread", baRange[1], 100);

            return copy;
        });
        setTradeFilters(prevState => {
            let copy = { ...prevState };

            // profit ration
            addOrRemoveFilter(copy, 'min.target_price_profit_ratio', profitRatio);
            // profit probability
            addOrRemoveFilter(copy, 'min.profit_prob', profitProb);

            return copy;
        });
        setFiltersAdjusted(false);
    }

    const setDefaultStates = (strategySettings, contractFilters, tradeFilters) => {
        setPremiumType(strategySettings['premium_type'] || 'market');
        setTargetPrice([
            strategySettings['target_price_lower'] || (isEmpty(basicInfo) ? 0 : fixedFloat(basicInfo.latestPrice)),
            strategySettings['target_price_upper'] || (isEmpty(basicInfo) ? 0 : fixedFloat(basicInfo.latestPrice))
        ]);
        setCashToInvest(strategySettings['cash_to_invest'] || 0);
        setMinOI(contractFilters['min.open_interest'] || 0);
        setMinVol(contractFilters['min.volume'] || 0);
        setMinLastTraded(contractFilters["min.last_trade_date"] ? Math.round((Date.now() - contractFilters["min.last_trade_date"] * 1000) / -(24 * 60 * 60 * 1000)) : 0);
        setBARange([contractFilters["min.bid_ask_spread"] || 0, contractFilters["max.bid_ask_spread"] || 100]);
        setProfitRatio(tradeFilters['min.target_price_profit_ratio'] || 0);
        setProfitProb(tradeFilters['min.profit_prob'] || 0);
    }

    const cancelFilterChanges = () => {
        setStrategySettings(previousStrategySettings);
        setContractFilters(previousContractFilters);
        setTradeFilters(previousTradeFilters);
        setDefaultStates(previousStrategySettings, previousContractFilters, previousTradeFilters);
        setFiltersAdjusted(false);
    }

    const clearAllFilters = () => {
        setStrategySettings({
            "target_price_lower": isEmpty(basicInfo) ? 0 : fixedFloat(basicInfo.latestPrice),
            "target_price_upper": isEmpty(basicInfo) ? 0 : fixedFloat(basicInfo.latestPrice),
        });
        setContractFilters({});
        setTradeFilters({});
    }

    const countFiltersFromGroup = (filterKeys) => {
        // can use following to do exact match if that is better?
        // return filterKeys.reduce((a, c) => a + Object.keys(filters).includes(c), 0);
        const allKeys = Object.keys(strategySettings).concat(Object.keys(contractFilters), Object.keys(tradeFilters));

        return allKeys.reduce((a, c) => a + filterKeys.some(k => c.includes(k)), 0);
    }

    const countFilters = () => {
        let num = Object.keys(contractFilters).length + Object.keys(tradeFilters).length;
        for (const [k, v] of Object.entries(strategySettings)) {
            if ((k === 'target_price_lower' || k === 'target_price_upper') && v == basicInfo.latestPrice) {
                continue;
            }
            num += 1;
        }
        if (strategySettings['target_price_lower'] != basicInfo.latestPrice && strategySettings['target_price_lower'] == strategySettings['target_price_upper']) {
            num -= 1;
        }

        return num;
    }

    useEffect(() => {
        setPreviousStrategySettings(strategySettings);
        setPreviousContractFilters(contractFilters);
        setPreviousTradeFilters(tradeFilters);
        setDefaultStates(strategySettings, contractFilters, tradeFilters);
    }, [basicInfo, strategySettings, contractFilters, tradeFilters]);

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
                                <Grid item xs={6}>
                                    <Typography variant="h6" color="white">
                                        {countFilters()} Filters
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}><Button variant="text" size="large" fullWidth onClick={clearAllFilters}>Reset</Button></Grid>
                            </>
                        }
                    </Grid>
                </ListSubheader>
                <GroupDivider />
                <ListItemGrid>
                    <PriceTargetBox
                        value={targetPrice}
                        setValue={(val) => { updateFilterValue(val, setTargetPrice) }}
                        initialPrice={isEmpty(basicInfo) ? 0 : basicInfo.latestPrice}
                    />
                </ListItemGrid>
                <ListItemGrid>
                    <Typography variant="button" gutterBottom><MetricLabel label="potential return" /></Typography>
                    <MaterialFilter
                        onFilterChange={(e) => { updateFilterValue(e.target.value, setProfitRatio) }}
                        options={minTargetPriceProfitRatio}
                        value={profitRatio}
                        defaultValue={0}
                    />
                </ListItemGrid>
                <ListItemGrid>
                    <Typography variant="button" gutterBottom><MetricLabel label="probability of profit" /></Typography>
                    <MaterialFilter
                        disabled={!user || !user.subscription}
                        onFilterChange={(e) => { updateFilterValue(e.target.value, setProfitProb) }}
                        options={minProfitProbOptions}
                        value={profitProb}
                        defaultValue={0}
                    />
                </ListItemGrid>

                <ListItemGrid>
                    <Typography variant="button" gutterBottom><MetricLabel label="premium price options" /></Typography>
                    <MaterialFilter
                        onFilterChange={(e) => { updateFilterValue(e.target.value, setPremiumType) }}
                        options={premiumPriceFilterOptions}
                        value={premiumType}
                        defaultValue={"market"}
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
                    <Typography variant="button" gutterBottom><MetricLabel label="cash to invest" /></Typography>
                    <DollarInputField
                        onFilterChange={(val) => { updateFilterValue(val, setCashToInvest) }}
                        placeholder="0 (optional)"
                        value={cashToInvest}
                    />
                </ListItemGrid>
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