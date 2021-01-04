import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import Axios from 'axios';
import getApiUrl from '../utils'


export default function TickerTypeahead({ setSelectedTicker, setExpirationTimestamps, setbasicInfo, /*optional*/resetStates, setModalActive, urlTicker}) {
    const API_URL = getApiUrl();
    const [allTickers, setAllTickers] = useState([]);
    const inputEl = useRef(null);
    let history = useHistory();

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
            setModalActive(true);
            const response = await Axios.get(`${API_URL}/tickers/${selected[0].symbol}`);
            setExpirationTimestamps(response.data.expiration_timestamps);
            setbasicInfo(response.data.quote)
            setSelectedTicker(selected);
            setModalActive(false);
            history.push(`/option-screener/${selected[0].symbol}`);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const onTickerSelectionChange = (selected) => {
        if (resetStates) {
            resetStates([]);
        }
        loadExpirationDates(selected);
        inputEl.current.blur();
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
            ref={inputEl}
        />
    );
}