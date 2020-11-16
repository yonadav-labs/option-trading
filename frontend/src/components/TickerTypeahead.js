import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Axios from 'axios';
import getApiUrl from '../utils'


export default function TickerTypeahead({ setSelectedTicker, setExpirationTimestamps, setbasicInfo, /*optional*/setBestCalls }) {
    const API_URL = getApiUrl();
    const [allTickers, setAllTickers] = useState([]);

    const loadTickers = async () => {
        try {
            const response = await Axios.get(`${API_URL}/tickers/`);
            let tickers = response.data;
            tickers.forEach(function (ticker) {
                if (ticker.full_name) {
                    ticker.display_label = ticker.symbol + ' - ' + ticker.full_name;
                } else {
                    ticker.display_label = ticker.symbol;
                }
            });
            setAllTickers(tickers);
        } catch (error) {
            console.error(error);
        }
    };

    const loadExpirationDates = async (selected) => {
        try {
            const response = await Axios.get(`${API_URL}/tickers/${selected[0].symbol}`);
            setExpirationTimestamps(response.data.expiration_timestamps);
            setbasicInfo(response.data.quote)
        } catch (error) {
            console.error(error);
        }
    };

    const onTickerSelectionChange = (selected) => {
        setSelectedTicker(selected);
        loadExpirationDates(selected);
        if (setBestCalls) {
            setBestCalls([]);
        }
    };

    useEffect(() => {
        loadTickers();
    }, []);

    return (
        <Typeahead
            minLengh={2}
            highlightOnlyResult={true}
            id="tickerTypeahead"
            labelKey="display_label"
            options={allTickers}
            placeholder="TSLA, APPL, GOOG..."
            onChange={onTickerSelectionChange}
            filterBy={(option, props) => {
                const uppercase_text = props.text.toUpperCase();
                return option['symbol'].startsWith(uppercase_text);
            }}
        />
    );
}