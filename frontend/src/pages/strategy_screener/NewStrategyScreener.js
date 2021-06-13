import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, {
    newLoadTickers, newLoadExpirationDates, fixedFloat,
    GetGaEventTrackingFunc, ExpDateFormatter
} from "../../utils";
import { useOktaAuth } from '@okta/okta-react';
import { debounce } from "lodash";

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from "../../components/querying";

const useDebouncedCallback = (callback, delay) => {
    const callbackRef = useRef();
    callbackRef.current = callback;
    return useCallback(debounce((...args) => callbackRef.current(...args), delay), []);
}

const GaEvent = GetGaEventTrackingFunc('strategy screener');

export default function NewStrategyScreener() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [bestTrades, setBestTrades] = useState(null);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState("none");

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
    const [sentiment, setSentiment] = useState(0);
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true)
    const [pageState, setPageState] = useState(true)

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamp("none");
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
            val.map((ts, index) => {
                arr.push({ value: ts, label: ExpDateFormatter(new Date(ts / 1000)) });
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
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, onBasicInfoChange, setSelectedTicker);
            addQuery(location, history, 'symbol', selected.symbol)
        } else {
            setExpirationDisabled(true)
        }
    };

    const onExpirationSelectionChange = (e) => {
        GaEvent('adjust exp date');
        setSelectedExpirationTimestamp(e)
        debouncedGetBestTrades()
    }

    const getBestTrades = async () => {
        try {
            if (selectedTicker && selectedExpirationTimestamp && filters.targetPriceLower && filters.targetPriceUpper) {
                let url = `${API_URL}/tickers/${selectedTicker.symbol}/trades/`;
                let body = {
                    "expiration_timestamps": [selectedExpirationTimestamp],
                    "strategy_settings": {
                        "premium_type": filters.premiumType,
                        "target_price_lower": filters.targetPriceLower,
                        "target_price_upper": filters.targetPriceUpper,
                        "cash_to_invest": filters.cashToInvest,
                    },
                    "contract_filters": {
                        "min.open_interest": filters.minOpenInterest,
                        "min.volume": filters.minVolume,
                        "min.last_trade_date": filters.lastTradedDate,
                        "max.bid_ask_spread": filters.maxBidAskSpread
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
                setBestTrades(trades);
                setPageState(false);
                setModalActive(false);
            }
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const debouncedGetBestTrades = useDebouncedCallback(getBestTrades, 50);
    const debouncedTextGetBestTrades = useDebouncedCallback(getBestTrades, 1000);

    // function to change filter states.
    const onFilterChange = (value, filterChoice) => {
        // Do not send API request if filter choice didn't change.
        if (filters[filterChoice] === value) {
            return;
        }
        setFilters(prevState => ({ ...prevState, [filterChoice]: value }));
        debouncedGetBestTrades();
    }

    // function to change filter states.
    const onTextFilterChange = (value, filterChoice) => {
        // Do not send API request if filter choice didn't change.
        if (filters[filterChoice] === value) {
            return;
        }
        setFilters(prevState => ({ ...prevState, [filterChoice]: value }));
        debouncedTextGetBestTrades();
    }

    const onSentimentChange = (sentiment) => {
        GaEvent('adjust sentiment');
        setSentiment(sentiment)
        if (sentiment > 0) {
            onFilterChange(fixedFloat(basicInfo.regularMarketPrice * sentiment), "targetPriceLower")
            onFilterChange(fixedFloat(basicInfo.regularMarketPrice * sentiment), "targetPriceUpper")
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
        newLoadTickers(headers, setAllTickers, setSelectedTicker, querySymbol, onTickerSelectionChange)
    }, []);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Discover option strategies with the best potential return.</title>
                <meta name="description" content="Discover option strategies with the best potential return with Tigerstance." />
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
                        basicInfo={basicInfo}
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
                        onTextFilterChange={onTextFilterChange}
                        filters={filters}
                    />
            }
        </>
    );
}
