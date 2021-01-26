import React, { useState } from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { PriceFormatter, PercentageFormatter } from '../utils';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

function TargetPriceRangeSlider(props) {

    const { currentPrice, setPriceLower, setPriceUpper } = props;
    const minPrice = 0.0;
    const maxPrice = currentPrice * 2;

    const marks = {
        [currentPrice]: (
            <span>{PriceFormatter(currentPrice)}<br />(last price)</span>
        ),
        [minPrice]: (<span>{PriceFormatter(minPrice)}<br />(-100%)</span>),
        [currentPrice * 0.5]: (<span>{PriceFormatter(currentPrice * 0.5)}<br />(-50%)</span>),
        [currentPrice * 1.5]: (<span>{PriceFormatter(currentPrice * 1.5)}<br />(+50%)</span>),
        [maxPrice]: (<span>{PriceFormatter(maxPrice)}<br />(+100%)</span>),
    };

    function onRangeChange(lowUpArr) {
        const lowerBound = lowUpArr[0];
        const upperBound = lowUpArr[1];

        setPriceLower(lowerBound);
        setPriceUpper(upperBound);
    };

    function getChangeRatio(price) {
        if (price >= currentPrice) {
            return (
                <span>+{PercentageFormatter(price / currentPrice - 1.0)}</span>
            )
        } else {
            return (
                <span>{PercentageFormatter(price / currentPrice - 1.0)}</span>
            )
        }
    }

    return (
        <Range
            allowCross={false}
            min={minPrice}
            max={maxPrice}
            step={0.05}
            defaultValue={[minPrice, maxPrice]}
            marks={marks}
            tipFormatter={value => (
                <div style={{ minWidth: '120px' }}>{PriceFormatter(value)} ({getChangeRatio(value)})</div>
            )}
            onAfterChange={onRangeChange}
        />
    )
}

export default TargetPriceRangeSlider;