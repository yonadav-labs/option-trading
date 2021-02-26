import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';


export default function TickerTypeahead({selectedTicker, allTickers, onTickerSelectionChange}) {

    return (
        <Typeahead
            minLength={2}
            highlightOnlyResult={true}
            clearButton
            id="tickerTypeahead"
            labelKey="display_label"
            options={allTickers}
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

