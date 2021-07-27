import React, { useState, useEffect, useContext } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import AskSignupModal from '../../components/AskSignupModal';
import LandingView from "./LandingView";
import MainView from "./MainView";
import UserContext from '../../UserContext';

// utils
import getApiUrl, {
    newLoadTickers, newLoadExpirationDates,
    GetGaEventTrackingFunc, ExpDateFormatter
} from "../../utils";
import { useOktaAuth } from '@okta/okta-react';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from "../../components/querying";

const GaEvent = GetGaEventTrackingFunc('strategy screener');

export default function Generator() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')
    const { user } = useContext(UserContext);

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [bestTrades, setBestTrades] = useState(null);
    const [isOpenAskSignupModal, setIsOpenAskSignupModal] = useState(false);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState("");

    // component management states
    const [loading, setLoading] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true)
    const [pageState, setPageState] = useState(true)

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const [sentiment, setSentiment] = useState(0);

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamp("none");
        setBasicInfo({});
        setLoading(false);
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
        }
    }

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setLoading, setExpirationTimestamps, setBasicInfo, setSelectedTicker);
            addQuery(location, history, 'symbol', selected.symbol)
        } else {
            setExpirationDisabled(true)
        }
    };

    const onExpirationSelectionChange = (e) => {
        GaEvent('adjust exp date');
        setSelectedExpirationTimestamp(e)
    }

    const getBestTrades = async (
        strategy_settings = {
            "target_price_lower": basicInfo.latestPrice || 0,
            "target_price_upper": basicInfo.latestPrice || 0,
        },
        contract_filters = {},
        trade_filters = {}
    ) => {
        try {
            if (selectedTicker && selectedExpirationTimestamp) {
                let url = `${API_URL}/tickers/${selectedTicker.symbol}/trades/`;
                let body = {
                    "expiration_timestamps": [selectedExpirationTimestamp],
                    "strategy_settings": strategy_settings,
                    "contract_filters": contract_filters,
                    "trade_filters": trade_filters,
                }
                setLoading(true);
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
                setLoading(false);
                if (!user) {
                    setIsOpenAskSignupModal(true);
                }
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
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
                <title>Tigerstance | Generate option strategies with the best potential return based on price targets.</title>
                <meta name="description" content="Generate option strategies with the best potential return based on price targets." />
            </Helmet>
            <AskSignupModal open={isOpenAskSignupModal}></AskSignupModal>
            {
                pageState ?
                    <LandingView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        expirationDisabled={expirationDisabled}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        selectedExpirationTimestamp={selectedExpirationTimestamp}
                        basicInfo={basicInfo}
                        setPageState={setPageState}
                        sentiment={sentiment}
                        setSentiment={setSentiment}
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
                        getBestTrades={getBestTrades}
                        sentiment={sentiment}
                        loading={loading}
                    />
            }
        </>
    );
}
