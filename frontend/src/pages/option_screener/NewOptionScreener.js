import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates, GetGaEventTrackingFunc } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';
import { debounce } from "lodash";

const useDebouncedCallback = (callback, delay) => {
    const callbackRef = useRef();
    callbackRef.current = callback;
    return useCallback(debounce((...args) => callbackRef.current(...args), delay), []);
}

const GaEvent = GetGaEventTrackingFunc('strategy screener');

export default function NewOptionScreener() {
    const API_URL = getApiUrl();

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [contracts, setContracts] = useState([]);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);

    // filter states
    const [filters, setFilters] = useState({
        // Set both lower/upper price to the same for single price target UI.
        // Use targetPriceLower as default for single price target UI.
        callToggle: true,
        putToggle: true,
        minStrike: 0,
        maxStrike: basicInfo.regularMarketPrice * 2 || 0,
        minVolume: 0,
        minOpenInterest: 0,
        maxBidAskSpread: 99999,
        delta: 1,
        lastTradedDate: -9999999,
    })

    // component management states
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true);
    const [pageState, setPageState] = useState(true);

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamps([]);
        setBasicInfo({});
        setModalActive(false);
        setContracts([]);
        setFilters({
            callToggle: true,
            putToggle: true,
            minStrike: 0,
            maxStrike: basicInfo.regularMarketPrice * 2 || 0,
            minVolume: 0,
            minOpenInterest: 0,
            maxBidAskSpread: 99999,
            delta: 1,
            lastTradedDate: -9999999,
        });
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
        onFilterChange(0, "minStrike");
        onFilterChange(val.regularMarketPrice * 2, "maxStrike");
    }

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, onBasicInfoChange, setSelectedTicker);
        } else {
            setExpirationDisabled(true)
        }
    };

    const onExpirationSelectionChange = (e) => {
        GaEvent('adjust exp date');
        setSelectedExpirationTimestamps(e)
    }

    const deleteExpirationChip = (e, value) => {
        setSelectedExpirationTimestamps(selectedExpirationTimestamps.filter(date => date.value !== value))
        debouncedGetContracts()
    }

    // function to change filter states.
    const onFilterChange = (value, filterChoice) => {
        // Do not send API request if filter choice didn't change.
        if (filters[filterChoice] === value) {
            return;
        }
        setFilters(prevState => ({ ...prevState, [filterChoice]: value }));
        debouncedGetContracts()
    }

    const onPutToggle = () => {
        if (filters.callToggle) {
            setFilters(prevState => ({ ...prevState, putToggle: !prevState.putToggle }));
            debouncedGetContracts()
        }
    }

    const onCallToggle = () => {
        if (filters.putToggle) {
            setFilters(prevState => ({ ...prevState, callToggle: !prevState.callToggle }));
            debouncedGetContracts()
        }
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
        newLoadTickers(headers, setAllTickers)
    }, []);

    const getContracts = async () => {
        try {
            if (selectedTicker && selectedExpirationTimestamps.length > 0) {
                let deltaMin
                let deltaMax
                if (filters.delta === 1) { deltaMin = -1; deltaMax = 1; }
                else { deltaMin = filters.delta; deltaMax = filters.delta + 0.2; }

                let bodyFilters = {
                    "min.strike": parseFloat(filters.minStrike),
                    "max.strike": parseFloat(filters.maxStrike),
                    "min.volume": filters.minVolume,
                    "min.open_interest": filters.minOpenInterest,
                    "max.bid_ask_spread": filters.maxBidAskSpread,
                    "min.delta": deltaMin,
                    "max.delta": deltaMax,
                    "min.last_trade_date": filters.lastTradedDate,
                }
                // add type filter based on toggles
                if (filters.callToggle && !filters.putToggle) {
                    bodyFilters["eq.is_call"] = true
                }
                if (!filters.callToggle && filters.putToggle) {
                    bodyFilters["eq.is_call"] = false
                }

                console.log(bodyFilters)

                let url = `${API_URL}/tickers/${selectedTicker.symbol}/contracts/`;
                let body = {
                    expiration_timestamps: selectedExpirationTimestamps.map(date => date.value),
                    filters: bodyFilters
                };
                setModalActive(true);
                const response = await Axios.post(url, body);
                let contracts = response.data.contracts;
                setContracts(contracts);
                setModalActive(false);
                setPageState(false)
            }
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
        GaEvent('fetch contracts');
    };

    const debouncedGetContracts = useDebouncedCallback(getContracts, 1000);


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
                        selectedExpirationTimestamps={selectedExpirationTimestamps}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        getContracts={getContracts}
                        debouncedGetContracts={debouncedGetContracts}
                    />
                    :
                    <MainView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        expirationDisabled={expirationDisabled}
                        selectedExpirationTimestamps={selectedExpirationTimestamps}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        deleteExpirationChip={deleteExpirationChip}
                        onFilterChange={onFilterChange}
                        onPutToggle={onPutToggle}
                        onCallToggle={onCallToggle}
                        basicInfo={basicInfo}
                        filters={filters}
                        contracts={contracts}
                        debouncedGetContracts={debouncedGetContracts}
                    />
            }
        </>
    );
}
