import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Axios from 'axios';
import getApiUrl from '../utils'

export default function TickerTypeahead({ setSelectedTicker, setExpirationTimestamps }) {
    const API_URL = getApiUrl();
    const [allTickers, setAllTickers] = useState([]);

    const loadTickers = async () => {
        try {
            const response = await Axios.get(`${API_URL}/tickers/`);
            setAllTickers(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadExpirationDates = async (selected) => {
        try {
            const response = await Axios.get(`${API_URL}/tickers/${selected[0].symbol}`);
            // console.log(response);
            setExpirationTimestamps(response.data.expiration_timestamps);
        } catch (error) {
            console.error(error);
        }
    };

    const onTickerSelectionChange = (selected) => {
        setSelectedTicker(selected);
        loadExpirationDates(selected);
    };

    useEffect(() => {
        loadTickers();
    }, []);

    return (
        <Typeahead
            minLengh={2}
            highlightOnlyResult={true}
            id="tickerTypeahead"
            labelKey="symbol"
            filterBy={['full_name']}
            options={allTickers}
            placeholder="TSLA, APPL, GOOG..."
            onChange={onTickerSelectionChange}
        />
    );
}