import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates, fixedFloat, GetGaEventTrackingFunc } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';
import { debounce } from "lodash";

// const useDebouncedCallback = (callback, delay) => {
//     const callbackRef = useRef();
//     callbackRef.current = callback;
//     return useCallback(debounce((...args) => callbackRef.current(...args), delay), []);
// }

const GaEvent = GetGaEventTrackingFunc('strategy screener');

export default function NewOptionScreener() {
    const API_URL = getApiUrl();

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [contracts, setContracts] = useState([]);
    const [strikePrices, setStrikePrices] = useState([]);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState("none");

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
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true)
    const [pageState, setPageState] = useState(true)

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamps("none");
        setBasicInfo({});
        setModalActive(false);
        setContracts([])
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

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setBasicInfo, setSelectedTicker);
        } else {
            setExpirationDisabled(true)
        }
    };

    const onExpirationSelectionChange = (e) => {
        GaEvent('adjust exp date');
        setSelectedExpirationTimestamps(e)
        // debouncedGetBestTrades()
    }

    // function to change filter states.
    const onFilterChange = (value, filterChoice) => {
        // Do not send API request if filter choice didn't change.
        if (filters[filterChoice] === value) {
            return;
        }
        setFilters(prevState => ({ ...prevState, [filterChoice]: value }));
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
            let url = `${API_URL}/tickers/${selectedTicker.symbol}/contracts/`;
            let body = {
                expiration_timestamps: [selectedExpirationTimestamps],
                filters: {}
            };
            setModalActive(true);
            const response = await Axios.post(url, body);
            let contracts = response.data.contracts;
            let strikes = [];
            setContracts(contracts);
            setStrikePrices(strikes);
            setModalActive(false);
            setPageState(false)
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
        GaEvent('fetch contracts');
    };

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
                        basicInfo={basicInfo}
                        onFilterChange={onFilterChange}
                        filters={filters}
                        contracts={contracts}
                    />
            }
        </>
    );
}
