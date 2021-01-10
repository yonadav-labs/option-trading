import React from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { PriceFormatter, PercentageFormatter } from '../utils';

function PriceSlider(props) {

    const { currentPrice, setOutterPrice } = props;

    const { createSliderWithTooltip } = Slider;
    const SliderWithHandle = createSliderWithTooltip(Slider);

    const priceMarks = {
        [currentPrice]: (
            <span>
                {PriceFormatter(currentPrice)}<br />
                (Current)
            </span>
        ),
        [0]: PriceFormatter(0.0),
        [currentPrice * 2]: PriceFormatter(currentPrice * 2),
    };

    function getRatio(price) {
        if (price > currentPrice) {
            return (
                <span>+{PercentageFormatter(price / currentPrice - 1.0)}</span>
            )
        } else if (price < currentPrice) {
            return (
                <span>{PercentageFormatter(price / currentPrice - 1.0)}</span>
            )
        } else {
            return (<span></span>)
        }
    }

    function onAfterChange(value) {
        setOutterPrice(value);
        console.log(value);
    }

    return (
        <SliderWithHandle
            min={0.0}
            max={currentPrice * 2}
            //step={0.02}
            marks={priceMarks}
            startPoint={currentPrice}
            included={false}
            tipFormatter={value => (
                <div style={{ minWidth: '120px' }}>{PriceFormatter(value)} ({getRatio(value)})</div>
            )}
            onAfterChange={onAfterChange}
        />
    )
}

export default PriceSlider