import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import Axios from 'axios';
import getApiUrl from '../utils'
import { addQuery } from './querying'


export default function TickerTypeahead({querySymbol, selectedTicker, setSelectedTicker, setExpirationTimestamps, setbasicInfo, /*optional*/resetStates, setModalActive }) {
    let history = useHistory();
    let location = useLocation();
    const API_URL = getApiUrl();
    const [allTickers, setAllTickers] = useState([]);
    const inputEl = useRef(null);

    const loadTickers = async () => {
        try {
            const response = await Axios.get(`${API_URL}/tickers/`);
            let tickers = response.data;
            tickers.map((ticker) => {
                if (ticker.full_name) {
                    ticker.display_label = ticker.symbol + ' - ' + ticker.full_name;
                } else {
                    ticker.display_label = ticker.symbol;
                }

                if (querySymbol && ticker.symbol === querySymbol) {
                    setSelectedTicker([ticker], onTickerSelectionChange([ticker]));
                }

                return ticker;
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
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const onTickerSelectionChange = (selected) => {
        if (selected.length > 0) {
            loadExpirationDates(selected);
            addQuery(location, history, 'symbol', selected[0].symbol)
        }
        if (resetStates) {
            resetStates([]);
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
            selected={selectedTicker}
            placeholder="Enter a ticker symbol. For example: TSLA, APPL, GOOG..."
            onChange={onTickerSelectionChange}
            filterBy={(option, props) => {
                const uppercase_text = props.text.toUpperCase();
                return option['symbol'].startsWith(uppercase_text);
            }}
            ref={inputEl}
        />
    );
};