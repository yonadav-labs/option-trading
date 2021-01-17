import React, { useState } from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { PriceFormatter, PercentageFormatter } from '../utils';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

function TargetPriceRangeSlider(props) {

    const { currentPrice, setPriceLower, setPriceUpper } = props;
    const minPrice = currentPrice * 0.5;
    const maxPrice = currentPrice * 1.5;

    const marks = {
        [currentPrice]: (
            <span>{PriceFormatter(currentPrice)} (latest)</span>
        ),
        [minPrice]: (<span>{PriceFormatter(minPrice)} (-50%)</span>),
        [currentPrice * 0.75]: (<span>{PriceFormatter(currentPrice * 0.75)} (-25%)</span>),
        [currentPrice * 1.25]: (<span>{PriceFormatter(currentPrice * 1.25)} (+25%)</span>),
        [maxPrice]: (<span>{PriceFormatter(maxPrice)} (+50%)</span>),
    };

    function onRangeChange(lowUpArr) {
        const lowerBound = lowUpArr[0];
        const upperBound = lowUpArr[1];

        setPriceLower(lowerBound);
        setPriceUpper(upperBound);
    };

    function getChangeRatio(price) {
        if (price > currentPrice) {
            return (
                <span>+{PercentageFormatter(price / currentPrice - 1.0)}</span>
            )
        } else if (price < currentPrice) {
            return (
                <span>{PercentageFormatter(price / currentPrice - 1.0)}</span>
            )
        }
        return (<span></span>)
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