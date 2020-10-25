import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Axios from 'axios';

export default function TickerTypeahead({ setSelectedTicker, setExpirationDates }) {
    const [allTickers, setAllTickers] = useState([]);

    const loadTickers = async () => {
        try {
            const response = await Axios.get('http://localhost:8080/tickers/');
            // console.log(response);
            setAllTickers(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadExpirationDates = async (selected) => {
        try {
            const response = await Axios.get('http://localhost:8080/tickers/' + selected[0].symbol);
            console.log(response);
            setExpirationDates(response.data.expiration_dates);
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