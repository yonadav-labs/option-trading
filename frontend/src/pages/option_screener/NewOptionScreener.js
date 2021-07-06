import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates, GetGaEventTrackingFunc, ExpDateFormatter } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from "../../components/querying";
import { Backdrop } from "@material-ui/core";

const GaEvent = GetGaEventTrackingFunc('option screener');

export default function NewOptionScreener() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [contracts, setContracts] = useState([]);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);

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
    }

    const setExpirationTimestamps = (val) => {
        setExpirationDisabled(true)
        if (val.length > 0) {
            let arr = []
            val.map((ts, index) => {
                arr.push({ value: ts, label: ExpDateFormatter(new Date(ts / 1000)) });
            })
            setExpirationTimestampsOptions(arr);
            setExpirationDisabled(false);
        }
    }

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setBasicInfo, setSelectedTicker);
            addQuery(location, history, 'symbol', selected.symbol)
        } else {
            setExpirationDisabled(true);
            setSelectedTicker(selected);
        }
    };

    const onExpirationSelectionChange = (e) => {
        GaEvent('adjust exp date');
        setSelectedExpirationTimestamps(e)
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
        newLoadTickers(headers, setAllTickers, setSelectedTicker, querySymbol, onTickerSelectionChange);
    }, []);

    const getContracts = async (filters = {}) => {
        try {
            if (selectedTicker && selectedExpirationTimestamps.length > 0) {
                let url = `${API_URL}/tickers/${selectedTicker.symbol}/contracts/`;
                let body = {
                    expiration_timestamps: selectedExpirationTimestamps.map(date => date.value),
                    filters: filters
                };
                setModalActive(true);
                const response = await Axios.post(url, body);
                let contracts = response.data.contracts;
                setContracts(contracts);
                setModalActive(false);
                setPageState(false)
            }
            else { setContracts([]) }
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
        GaEvent('fetch contracts');
    };

    return (
        <>
            <Helmet>
                <title>Tigerstance | Screen and filter for option contracts from the options chain.</title>
                <meta name="description" content="Screen and filter for option contracts from the options chain with Tigerstance." />
            </Helmet>
            {/* TODO: make this a reusable component */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={modalActive}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
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
                        getContracts={getContracts}
                        basicInfo={basicInfo}
                        contracts={contracts}
                    />
            }
        </>
    );
}
