import React, {useState, useEffect} from "react";
import Axios from 'axios';
import {CssBaseline} from "@material-ui/core";
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";
import MainView from "./MainView";
import './StrategyScreen.css'

// utils
import getApiUrl, { newLoadTickers, newLoadExpirationDates } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';

export default function NewStrategyScreener() {
    const API_URL = getApiUrl();

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState();
    const [basicInfo, setBasicInfo] = useState({});
    const [targetPriceLower, setTargetPriceLower] = useState(null);
    const [targetPriceUpper, setTargetPriceUpper] = useState(null);
    const [bestStrategies, setBestStrategies] = useState(null);

    // expiration date states
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState([]);

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
            setHeaders({Authorization: `Bearer ${accessToken.accessToken}`});
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

    const getBestStrategies = async () => {
        console.log(selectedExpirationTimestamp)
        try {
            let url = `${API_URL}/dev/tickers/${selectedTicker.symbol}/trades/`;
            let body = {
                "expiration_timestamps": [selectedExpirationTimestamp[0].value],
                "contract_filters": {
                    "min.open_interest": 10,
                    "min.volume": 1,
                    "min.last_trade_date": -7
                },
                "strategy_settings": {
                    "premium_type": "market",
                    "target_price_lower": targetPriceLower,
                    "target_price_upper": targetPriceUpper
                }
            }
            setModalActive(true);
            const response = await Axios.post(url, body);
            let trades = response.data.trades;
            trades.map((val, index) => {
                val.type2 = val.type;
                val.min_last_trade_date2 = val.min_last_trade_date;
                val.min_volume2 = val.min_volume;
                val.id = index;
                return val;
            })
            setBestStrategies(trades);
            setPageState(false)
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    return (
        <div className="strategy-screener">
            <CssBaseline />
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
                        getBestStrategies={getBestStrategies}
                        bestStrategies={bestStrategies}
                    />
                    :
                    <MainView 
                        allTickers={allTickers} 
                        onTickerSelectionChange={onTickerSelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        expirationDisabled={expirationDisabled}
                        onExpirationSelectionChange={onExpirationSelectionChange}
                        selectedExpirationTimestamp={selectedExpirationTimestamp}
                        bestStrategies={bestStrategies}
                        basicInfo={basicInfo}
                    />
            }
        </div>
    );
}
