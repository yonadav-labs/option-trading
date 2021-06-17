import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';


export default function TickerTypeahead({ selectedTicker, allTickers, onTickerSelectionChange }) {
    const options = allTickers.filter(ticker => ticker.symbol);

    return (
        <Typeahead
            highlightOnlyResult={true}
            clearButton
            id="tickerTypeahead"
            labelKey="display_label"
            options={options}
            selected={selectedTicker}
            placeholder="Enter a ticker symbol. For example: TSLA, AAPL, GOOG..."
            onChange={onTickerSelectionChange}
            filterBy={(option, props) => {
                const uppercase_text = props.text.toUpperCase();
                return option['symbol'].startsWith(uppercase_text);
            }}
        />
    );

};

