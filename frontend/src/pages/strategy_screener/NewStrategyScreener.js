import React, { useState, useEffect } from "react";
import Axios from 'axios';
import { Box } from "@material-ui/core";
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";
import MainView from "./MainView";
// import './StrategyScreen.css'

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';

export default function NewStrategyScreener() {
    const API_URL = getApiUrl();

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState();
    const [basicInfo, setBasicInfo] = useState({});
    const [bestTrades, setBestTrades] = useState(null);

    // expiration date states
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState([]);

    // filter states
    const [targetPriceLower, setTargetPriceLower] = useState(null);
    const [targetPriceUpper, setTargetPriceUpper] = useState(null);
    const [filters, setFilters] = useState({
        targetPriceLower: null,
        targetPriceUpper: null,
        premiumType: 'market',
        cashToInvest: null,
        minVolume: 0,
        minOpenInterest: 0,
        lastTradedDate: -9999999,
        tenPercentWorstReturnRatio: -1.0,
    })

    // component management states
    const [sentiment, setSentiment] = useState('');
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true)
    const [pageState, setPageState] = useState(true)

    // okta states
    const [headers, setHeaders] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestamps([]);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamp([]);
        setBasicInfo({});
        setModalActive(false);
        setSentiment('')
        setTargetPriceLower(null)
        setTargetPriceUpper(null)
        setFilters({
            targetPriceLower: null,
            targetPriceUpper: null,
            premiumType: 'market',
            cashToInvest: null,
            strategyType: 'all',
            minVolume: 0,
            minOpenInterest: 0,
            lastTradedDate: -9999999,
            tenPercentWorstReturnRatio: -1.0,
        })
    }

    const onTickerSelectionChange = (e, selected) => {
        resetStates()
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setBasicInfo, setSelectedTicker);
        } else {
            setExpirationDisabled(true)
        }
    };

    const onExpirationSelectionChange = (e, selected) => {
        setSelectedExpirationTimestamp(selected)
    }

    useEffect(() => {
        if (authState.isAuthenticated) {
            const { accessToken } = authState;
            setHeaders({ Authorization: `Bearer ${accessToken.accessToken}` });
        } else {
            setHeaders({});
        }
    }, [oktaAuth, authState]);

    useEffect(() => {
        if (headers) {
            newLoadTickers(headers, setAllTickers);
        }
    }, [headers]);

    // when expiration dates are changed set new date options
    useEffect(() => {
        setExpirationDisabled(true)
        if (expirationTimestamps.length > 0) {
            let arr = []
            expirationTimestamps.map((timestamp, index) => {
                // Yahoo's timestamp * 1000 = TD's timestamp.
                const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
                    .toLocaleDateString('en-US');
                arr.push({ value: timestamp, label: date });
            })
            setExpirationTimestampsOptions(arr)
            setExpirationDisabled(false)
        }
    }, [expirationTimestamps])

    // function to set upper and lower limit when selecting sentiment
    const setTargetPriceBySentiment = (sentiment) => {
        setSentiment(sentiment)
        switch (sentiment) {
            case 'bullish':
                setTargetPriceLower(basicInfo.regularMarketPrice)
                setTargetPriceUpper(basicInfo.regularMarketPrice * 1.1)
                break;
            case 'bearish':
                setTargetPriceLower(basicInfo.regularMarketPrice * 0.9)
                setTargetPriceUpper(basicInfo.regularMarketPrice)
                break;
            default:
                break;
        }
    }

    const setTargetPrice = () => {
        setFilters({ ...filters, targetPriceLower: targetPriceLower, targetPriceUpper: targetPriceUpper })
    }

    const getBestTrades = async () => {
        try {
            let url = `${API_URL}/dev/tickers/${selectedTicker.symbol}/trades/`;
            let body = {
                "expiration_timestamps": [selectedExpirationTimestamp[0].value],
                "strategy_settings": {
                    "premium_type": filters.premiumType,
                    "target_price_lower": filters.targetPriceLower,
                    "target_price_upper": filters.targetPriceUpper,
                    "cash_to_invest": filters.cashToInvest,
                },
                "contract_filters": {
                    "min.open_interest": filters.minOpenInterest,
                    "min.volume": filters.minVolume,
                    "min.last_trade_date": filters.lastTradedDate
                },
                "trade_filters": {
                    "min.ten_percent_worst_return_ratio": filters.tenPercentWorstReturnRatio,
                },
            }
            setModalActive(true);
            const response = await Axios.post(url, body, { headers });
            let trades = response.data.trades;
            trades.map((val, index) => {
                val.type2 = val.type;
                val.min_last_trade_date2 = val.min_last_trade_date;
                val.min_volume2 = val.min_volume;
                val.id = index;
                return val;
            })
            setBestTrades(trades);
            setPageState(false)
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    // function to change filter states
    const onFilterChange = (event, filterChoice, eventTwo) => {
        switch (filterChoice) {
            case 'premium':
                setFilters({ ...filters, premiumType: event.target.value })
                break;
            case 'cash':
                setFilters({ ...filters, cashToInvest: event })
                break;
            case 'volume':
                setFilters({ ...filters, minVolume: event.target.value })
                break;
            case 'interest':
                setFilters({ ...filters, minOpenInterest: event.target.value })
                break;
            case 'lastTraded':
                setFilters({ ...filters, lastTradedDate: event.target.value })
                break;
            case 'targetPrice':
                setFilters({ ...filters, targetPriceLower: event, targetPriceUpper: eventTwo })
                break;
            case 'lowerTarget':
                setFilters({ ...filters, targetPriceLower: event })
                break;
            case 'higherTarget':
                setFilters({ ...filters, targetPriceUpper: event })
                break;
            case 'tenPercentWorstReturnRatio':
                setFilters({ ...filters, tenPercentWorstReturnRatio: event.target.value })
                break;

            default:
                break;
        }
    }

    // fetch new trades when filter changes
    useEffect(() => {
        getBestTrades()
    }, [filters])

    return (
        <Box sx={{ flexGrow: 1 }} className="min-vh-100">
            <ModalSpinner active={modalActive}></ModalSpinner>
            {
                pageState ?
                    <LandingView
                        allTickers={allTickers}
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        expirationDisabled={expirationDisabled}
                        sentiment={sentiment}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        selectedExpirationTimestamp={selectedExpirationTimestamp}
                        setTargetPriceBySentiment={setTargetPriceBySentiment}
                        setTargetPrice={setTargetPrice}
                    />
                    :
                    <MainView
                        allTickers={allTickers}
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        expirationDisabled={expirationDisabled}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        selectedExpirationTimestamp={selectedExpirationTimestamp}
                        bestTrades={bestTrades}
                        basicInfo={basicInfo}
                        onFilterChange={onFilterChange}
                        filters={filters}
                    />
            }
        </Box>
    );
}
