import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates, GetGaEventTrackingFunc } from "../../utils";
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

export default function NewBuild() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});

    // expiration date states
    const [selectedStrategy, setSelectedStrategy] = useState(null)
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);

    // component management states
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true);
    const [strategyDisabled, setStrategyDisabled] = useState(true)
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
    }

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, onBasicInfoChange, setSelectedTicker);
            addQuery(location, history, 'symbol', selected.symbol)
            setStrategyDisabled(false)
        } else {
            setExpirationDisabled(true)
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
                        strategyDisabled={strategyDisabled}
                        selectedStrategy={selectedStrategy}
                    />
                    :
                    null
                // <MainView
                //     allTickers={allTickers}
                //     selectedTicker={selectedTicker}
                //     onTickerSelectionChange={onTickerSelectionChange}
                //     expirationTimestampsOptions={expirationTimestampsOptions}
                //     expirationDisabled={expirationDisabled}
                //     selectedExpirationTimestamps={selectedExpirationTimestamps}
                //     onExpirationSelectionChange={onExpirationSelectionChange}
                //     deleteExpirationChip={deleteExpirationChip}
                //     onFilterChange={onFilterChange}
                //     onTextFilterChange={onTextFilterChange}
                //     onPutToggle={onPutToggle}
                //     onCallToggle={onCallToggle}
                //     basicInfo={basicInfo}
                //     filters={filters}
                //     contracts={contracts}
                //     debouncedGetContracts={debouncedGetContracts}
                // />
            }
        </>
    );
}
