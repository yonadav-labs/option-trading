import React, { useState, useEffect, useContext } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import AskSignupModal from '../../components/AskSignupModal';
import LandingView from "./LandingView";
import MainView from "./MainView";
import UserContext from '../../UserContext';
import LoadingModal from "../../components/LoadingModal";

// utils
import getApiUrl, { LoadTickers, LoadExpirationDates, GetGaEventTrackingFunc, ExpDateFormatter } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { useSearch } from "../../components/querying";

const GaEvent = GetGaEventTrackingFunc('option screener');

export default function NewOptionScreener() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')
    const queryDates = useSearch(location, 'dates')
    const { user } = useContext(UserContext);

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [contracts, setContracts] = useState([]);
    const [filters, setFilters] = useState({});

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);

    // component management states
    const [loading, setLoading] = useState(false);
    const [isOpenAskSignupModal, setIsOpenAskSignupModal] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true);
    const [pageState, setPageState] = useState(true);
    const [urlPage, setUrlPage] = useState(false)

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamps([]);
        setBasicInfo({});
        setLoading(false);
        setContracts([]);
        setFilters({})
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
        // history.replace({
        //     search: ""
        // })
        if (selected) {
            let query = { "symbol": selected.symbol }
            history.push({
                search: new URLSearchParams(query).toString()
            })
            setSelectedTicker(selected);
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
        LoadTickers(headers, setAllTickers, setSelectedTicker, querySymbol, onTickerSelectionChange);
    }, []);

    useEffect(() => {
        if (selectedTicker) {
            LoadExpirationDates(headers, selectedTicker, setLoading, setExpirationTimestamps, setBasicInfo);
        }
    }, [selectedTicker])

    useEffect(() => {
        if (queryDates && expirationTimestampsOptions.length > 0) {
            let dates = queryDates.split(",")
            let selectedDate = []
            dates.forEach(ts => {
                expirationTimestampsOptions.forEach(option => {
                    if (option.value === parseInt(ts)) {
                        selectedDate.push(option)
                    }
                })
            })
            setSelectedExpirationTimestamps(selectedDate)
            setPageState(false)
        }
    }, [expirationTimestampsOptions])

    const getContracts = async (filters = {}) => {
        try {
            // querying
            let datesArray = []
            selectedExpirationTimestamps.map(date => datesArray.push(date.value))
            let query = { "symbol": selectedTicker.symbol }
            if (datesArray.length > 0) {
                query["dates"] = datesArray
            }
            for (const key in filters) {
                if (Object.hasOwnProperty.call(filters, key)) {
                    const element = filters[key];
                    query[key] = element
                }
            }
            history.replace({
                search: new URLSearchParams(query).toString()
            })
            // end query

            if (selectedTicker && selectedExpirationTimestamps.length > 0) {
                let url = `${API_URL}/tickers/${selectedTicker.symbol}/contracts/`;
                let body = {
                    expiration_timestamps: selectedExpirationTimestamps.map(date => date.value),
                    filters: filters
                };
                setLoading(true);
                const response = await Axios.post(url, body);
                let contracts = response.data.contracts;
                setContracts(contracts);
                setPageState(false);
                setLoading(false);
            }
            else { setContracts([]) }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
        GaEvent('fetch contracts');
    };

    useEffect(() => {
        if (location.search === "") {
            resetStates()
            setPageState(true)
        }
    }, [location])

    return (
        <>
            <Helmet>
                <title>Tigerstance | Screen and filter for option contracts from the options chain.</title>
                <meta name="description" content="Screen and filter for option contracts from the options chain with Tigerstance." />
            </Helmet>
            <LoadingModal active={loading} />
            <AskSignupModal open={isOpenAskSignupModal}></AskSignupModal>
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
                        setPageState={setPageState}
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
                        urlPage={urlPage}
                        setUrlPage={setUrlPage}
                        loading={loading}
                        user={user}
                        setIsOpenAskSignupModal={setIsOpenAskSignupModal}
                        filters={filters}
                        setFilters={setFilters}
                    />
            }
        </>
    );
}
