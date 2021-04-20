import React, { useState, useEffect, useCallback, useRef } from "react";
import {Helmet} from "react-helmet";
import Axios from 'axios';
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates, fixedFloat } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';
import { debounce } from "lodash";

const useDebouncedCallback = (callback, delay) => {
    const callbackRef = useRef();
    callbackRef.current = callback;
    return useCallback(debounce((...args) => callbackRef.current(...args), delay), []);
}

export default function NewStrategyScreener() {
    const API_URL = getApiUrl();

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [bestTrades, setBestTrades] = useState(null);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState(null);

    // filter states
    const [filters, setFilters] = useState({
        // Set both lower/upper price to the same for single price target UI.
        // Use targetPriceLower as default for single price target UI.
        targetPriceLower: basicInfo.regularMarketPrice || 0,
        targetPriceUpper: basicInfo.regularMarketPrice || 0,
        premiumType: 'market',
        cashToInvest: null,
        minVolume: 0,
        minOpenInterest: 0,
        lastTradedDate: -9999999,
        minProfitProb: 0.0,
        minTargetPriceProfitRatio: 0.0,
    })

    // component management states
    const [sentiment, setSentiment] = useState('');
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true)
    const [pageState, setPageState] = useState(true)

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamp(null);
        setBasicInfo({});
        setModalActive(false);
        setFilters({
            targetPriceLower: basicInfo.regularMarketPrice || 0,
            targetPriceUpper: basicInfo.regularMarketPrice || 0,
            premiumType: 'market',
            cashToInvest: null,
            strategyType: 'all',
            minVolume: 0,
            minOpenInterest: 0,
            lastTradedDate: -9999999,
            minProfitProb: 0.0,
            minTargetPriceProfitRatio: 0.0,
        })
        setBestTrades(null)
    }

    const setExpirationTimestamps = (val) => {
        setExpirationDisabled(true)
        if (val.length > 0) {
            let arr = []
            val.map((timestamp, index) => {
                // Yahoo's timestamp * 1000 = TD's timestamp.
                const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
                    .toLocaleDateString('en-US');
                arr.push({ value: timestamp, label: date });
            })
            setExpirationTimestampsOptions(arr)
            setExpirationDisabled(false)
            // onExpirationSelectionChange(null, arr[0])
        }
    }

    const onBasicInfoChange = (val) => {
        setBasicInfo(val);
        if (sentiment) {
            onFilterChange(val.regularMarketPrice, "targetPriceLower");
            onFilterChange(val.regularMarketPrice, "targetPriceUpper");
        }
    }

    const onTickerSelectionChange = (e, selected) => {
        resetStates()
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, onBasicInfoChange, setSelectedTicker);
        } else {
            setExpirationDisabled(true)
        }
    };

    const onExpirationSelectionChange = (e, selected) => {
        setSelectedExpirationTimestamp(selected)
        debouncedGetBestTrades()
    }

    const getBestTrades = async () => {
        try {
            if (selectedTicker && selectedExpirationTimestamp && filters.targetPriceLower && filters.targetPriceUpper) {
                let url = `${API_URL}/dev/tickers/${selectedTicker.symbol}/trades/`;
                let body = {
                    "expiration_timestamps": [selectedExpirationTimestamp.value],
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
                        "min.target_price_profit_ratio": filters.minTargetPriceProfitRatio,
                        "min.profit_prob": filters.minProfitProb,
                    },
                }
                setModalActive(true);
                const response = await Axios.post(url, body, { headers: headers });
                let trades = response.data.trades;
                trades.map((val, index) => {
                    val.type2 = val.type;
                    val.min_last_trade_date2 = val.min_last_trade_date;
                    val.min_volume2 = val.min_volume;
                    val.id = index;
                    return val;
                });
                trades.sort((a, b) => b.target_price_profit_ratio - a.target_price_profit_ratio);
                setBestTrades(trades);
                setPageState(false);
                setModalActive(false);
            }
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const debouncedGetBestTrades = useDebouncedCallback(getBestTrades, 1000);

    // function to change filter states.
    const onFilterChange = (value, filterChoice) => {
        // Do not send API request if filter choice didn't change.
        if (filters[filterChoice] === value) {
            return;
        }
        setFilters(prevState => ({ ...prevState, [filterChoice]: value }));
        debouncedGetBestTrades();
    }

    const onSentimentChange = (sentiment) => {
        setSentiment(sentiment)
        if (sentiment) {
            switch (sentiment.toLowerCase()) {
                case 'bullish':
                    onFilterChange(fixedFloat(basicInfo.regularMarketPrice * 1.05), "targetPriceLower")
                    onFilterChange(fixedFloat(basicInfo.regularMarketPrice * 1.05), "targetPriceUpper")
                    break;
                case 'bearish':
                    onFilterChange(fixedFloat(basicInfo.regularMarketPrice * 0.95), "targetPriceLower")
                    onFilterChange(fixedFloat(basicInfo.regularMarketPrice * 0.95), "targetPriceUpper")
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        if (authState.isAuthenticated) {
            const { accessToken } = authState;
            setHeaders({ Authorization: `Bearer ${accessToken.accessToken}` });
        } else {
            setHeaders({});
        }
    }, [oktaAuth, authState]);

    useEffect(() => {
        newLoadTickers(headers, setAllTickers)
    }, []);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Discover</title>
            </Helmet>
            <ModalSpinner active={modalActive}></ModalSpinner>
            {
                pageState ?
                    <LandingView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        expirationDisabled={expirationDisabled}
                        sentiment={sentiment}
                        onSentimentChange={onSentimentChange}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        selectedExpirationTimestamp={selectedExpirationTimestamp}
                    />
                    :
                    <MainView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
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
        </>
    );
}
