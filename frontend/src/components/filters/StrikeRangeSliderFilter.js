import React from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Comparator } from 'react-bootstrap-table2-filter';
import { PriceFormatter, PercentageFormatter } from '../../utils';

function StrikeRangeSliderFilter(props) {

    const { atmPrice, strikePrices, minStrikeFilter, maxStrikeFilter } = props;

    const { createSliderWithTooltip } = Slider;
    const Range = createSliderWithTooltip(Slider.Range);
    const minStrike = Math.min(...strikePrices);
    const maxStrike = Math.max(...strikePrices);

    const marks = {
        [atmPrice]: (
            <span>
                {PriceFormatter(atmPrice)}<br />
                (ATM)
            </span>
        ),
        [minStrike]: PriceFormatter(minStrike),
        [maxStrike]: PriceFormatter(maxStrike),
    };

    function onRangeChange(lowUpArr) {
        const lowerBound = lowUpArr[0];
        const upperBound = lowUpArr[1];

        minStrikeFilter({
            number: lowerBound,
            comparator: Comparator.GE
        });
        maxStrikeFilter({
            number: upperBound,
            comparator: Comparator.LE
        });
    };

    function getMoneyness(price) {
        if (price > atmPrice) {
            return (
                <span>+{PercentageFormatter(price / atmPrice - 1.0)}</span>
            )
        } else if (price < atmPrice) {
            return (
                <span>{PercentageFormatter(price / atmPrice - 1.0)}</span>
            )
        } else {
            return (<span></span>)
        }
    }

    return (
        <Range
            allowCross={false}
            min={minStrike}
            max={maxStrike}
            defaultValue={[minStrike, maxStrike]}
            marks={marks}
            tipFormatter={value => (
                <div style={{ minWidth: '80px' }}>{PriceFormatter(value)} ({getMoneyness(value)})</div>
            )}
            onAfterChange={onRangeChange}
        />
    )
}

export default StrikeRangeSliderFilter