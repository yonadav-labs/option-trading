import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import ModalSpinner from '../../components/LoadingModal';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates, GetGaEventTrackingFunc } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';
import { debounce } from "lodash";
import Moment from 'react-moment';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from "../../components/querying";

const useDebouncedCallback = (callback, delay) => {
    const callbackRef = useRef();
    callbackRef.current = callback;
    return useCallback(debounce((...args) => callbackRef.current(...args), delay), []);
}

const GaEvent = GetGaEventTrackingFunc('surface');

export default function Surface() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [baseHeatmapData, setBaseHeatmapData] = useState(null);
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([{}])

    const initialFilters = {
        contractType: 'call',
        metric: 'Implied Volatility',
        minStrike: 0,
        maxStrike: 0,
        minExpiration: 0,
        maxExpiration: 0,
        minVolume: 0,
        minOpenInterest: 0,
        maxBidAskSpread: 99999,
        delta: 1,
        lastTradedDate: -9999999
    }

    // filter states
    const [filters, setFilters] = useState(initialFilters)

    // component management states
    const [modalActive, setModalActive] = useState(false);
    const [pageState, setPageState] = useState(true);

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const contractTypeOptions = [
        { value: 'call', label: 'Call' },
        { value: 'put', label: 'Put' }
    ]

    const targetOptions = [
        { value: 'Implied Volatility', label: 'Implied Volatility' },
        { value: 'Open Interest', label: 'Open Interest' },
        { value: 'Volume', label: 'Volume' },
        { value: 'vol_per_oi', label: 'VOL/OI' },
        { value: 'bid', label: 'Bid' },
        { value: 'ask', label: 'Ask' },
        { value: 'mark', label: 'Mark' },
    ]

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([{}])
        setBasicInfo({ latestPrice: 0 });
        setModalActive(false);
        setBaseHeatmapData(null);
        setFilters({ ...initialFilters, contractType: filters.contractType, metric: filters.metric });
    }

    const setExpirationTimestamps = (val) => {
        if (val.length > 0) {
            let arr = []
            val.map((ts, index) => {
                arr.push({
                    value: ts,
                    label:
                        <span style={{ fontSize: '0.8rem' }}>
                            <Moment date={new Date(ts)} format="MM/DD/YYYY" />
                        </span>
                });
            })
            setExpirationTimestampsOptions(arr);

            onFilterChange(arr[0].value, "minExpiration");
            onFilterChange(arr[arr.length - 1].value, "maxExpiration");
        }
    }

    const onBasicInfoChange = (val) => {
        setBasicInfo(val);
        onFilterChange(0, "minStrike");
        onFilterChange(val.latestPrice * 2, "maxStrike");
    }

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, onBasicInfoChange, setSelectedTicker);
            addQuery(location, history, 'symbol', selected.symbol)
        }
    };

    // function to change filter states.
    const onFilterChange = (value, filterChoice) => {
        // Do not send API request if filter choice didn't change.
        if (filters[filterChoice] === value) {
            return;
        }
        setFilters(prevState => ({ ...prevState, [filterChoice]: value }));
        if (filterChoice !== 'metric') {
            debouncedLoadHeatMap()
        }
    }

    const loadHeatmapData = async () => {
        try {
            if (selectedTicker) {
                setModalActive(true);
                let deltaMin;
                let deltaMax;
                if (filters.delta === 1) {
                    deltaMin = -1;
                    deltaMax = 1;
                } else {
                    deltaMin = filters.delta;
                    deltaMax = filters.delta + 0.2;
                }

                let bodyFilters = {
                    "min.strike": parseFloat(filters.minStrike),
                    "max.strike": parseFloat(filters.maxStrike),
                    "min.volume": filters.minVolume,
                    "min.open_interest": filters.minOpenInterest,
                    "max.bid_ask_spread": filters.maxBidAskSpread,
                    "min.delta": deltaMin,
                    "max.delta": deltaMax,
                    "min.last_trade_date": filters.lastTradedDate,
                    "eq.is_call": filters.contractType == 'call'
                };

                const url = `${API_URL}/tickers/${selectedTicker.symbol}/heatmap_data/`;
                let body = {
                    expiration_timestamps: expirationTimestampsOptions.map(date => date.value).filter(value => value >= filters.minExpiration && value <= filters.maxExpiration),
                    filters: bodyFilters
                };

                const response = await Axios.post(url, body);
                setBaseHeatmapData(response.data);
                setModalActive(false);
                setPageState(false)
            } else {
                setBaseHeatmapData(null);
            }
        } catch (error) {
            console.error(error);
            setModalActive(false);
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

    const debouncedLoadHeatMap = useDebouncedCallback(loadHeatmapData, 50);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Implied Volatility Surface and more</title>
                <meta name="description"
                    content="Gauge the market using Implied Volatility Surface, Open Interest and Volume. Quickly identify calls/puts to sell by their annualized premium return and probability of expiring out of the money." />
            </Helmet>
            <ModalSpinner active={modalActive}></ModalSpinner>

            {
                pageState ?
                    <LandingView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        onFilterChange={onFilterChange}
                        contractTypeOptions={contractTypeOptions}
                        targetOptions={targetOptions}
                        filters={filters}
                    />
                    :
                    <MainView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        onFilterChange={onFilterChange}
                        basicInfo={basicInfo}
                        contractTypeOptions={contractTypeOptions}
                        targetOptions={targetOptions}
                        baseHeatmapData={baseHeatmapData}
                        filters={filters}
                    />
            }
        </>
    );
}
