import React, { useState } from "react";
import { FormGroup, FormControlLabel, Switch, Typography, Grid } from "@material-ui/core";
import { PercentageFormatter } from '../utils';
import Moment from 'react-moment';


function pickHex(color1, color2, weight) {
    let p = weight;
    let w = p * 2 - 1;
    let w1 = (w / 1 + 1) / 2;
    let w2 = 1 - w1;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

export default function OptionValueMatrix({ matrixInfo, stockPrice, cost }) {
    const valRange = matrixInfo.max - matrixInfo.min;
    const [showPercent, setShowPercent] = useState(false);

    const pricePercent = (price) => {
        let val = (price - stockPrice) * 100 / stockPrice;
        val = Math.round(val * 10) / 10;
        if (val > 0) {
            return `+${val.toFixed(1)}%`;
        } else if (val < 0) {
            return `${val.toFixed(1)}%`;
        } else {
            return '0.0%';
        }
    }
    const midVal = 0;

    const gradient = [
        [
            matrixInfo.min,
            [225, 0, 0]
        ],
        [
            midVal,
            [255, 255, 255]
        ],
        [
            matrixInfo.max,
            [0, 225, 0]
        ]
    ];

    return (
        <Grid container item justifyContent="center">
            <Grid item xs={12}>
                <Typography variant="h5" align="center">Return over time by stock price</Typography>
            </Grid>
            <Grid container item justifyContent="center" xs={12}>
                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showPercent}
                                onChange={(event) => setShowPercent(event.target.checked)}
                                color="primary"
                                name="checkedB"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        }
                        label="Show Return Percent"
                        labelPlacement="start"
                    />
                </FormGroup>
            </Grid>
            <Grid container item justifyContent="center" xs={12}>
                <div style={{ overflowX: 'auto', paddingTop: 20 }}>
                    <table className="option-matrix" style={{ fontSize: 14.5 }}>
                        <tr>
                            <td></td>
                            {matrixInfo.dates.map((date, idx) =>
                                <td key={idx}>
                                    <Typography
                                        variant="subtitle2"
                                        align="center"
                                        style={{
                                            WebkitTransform: 'translateX(10%) translateY(-35%) rotate(-45deg)',
                                            transform: 'translateX(10%) translateY(-35%) rotate(-45deg)',
                                        }}
                                        noWrap
                                    >
                                        <Moment format="MMM D">{date}</Moment>
                                    </Typography>
                                </td>
                            )}
                            <td><Typography variant="subtitle2" align="center">+/-%</Typography></td>
                        </tr>
                        {matrixInfo.prices.map((price, idx) => (
                            <tr key={idx} className={Math.abs(price - stockPrice) < 0.125 ? 'stock-price' : ''}>
                                <td><Typography variant="subtitle2" align="left">${price.toFixed(2)}</Typography></td>
                                {matrixInfo.values[idx].map((val, index) => {
                                    let colorRange = val < midVal ? [0, 1] : [1, 2];
                                    let firstcolor = gradient[colorRange[0]][1];
                                    let secondcolor = gradient[colorRange[1]][1];
                                    // Calculate ratio between the two closest colors
                                    let firstcolor_x = valRange * gradient[colorRange[0]][0] / 100;
                                    let secondcolor_x = valRange * (gradient[colorRange[1]][0] / 100) - firstcolor_x;
                                    let val_x = valRange * (val / 100) - firstcolor_x;
                                    let ratio = val_x / secondcolor_x
                                    // Get the color with pickHex(thx, less.js's mix function!)
                                    let bgColor = pickHex(secondcolor, firstcolor, ratio);
                                    bgColor = 'rgb(' + bgColor.join() + ')';
                                    let tooltip = `Date: ${matrixInfo.dates[index]}\nStock price: $${price.toFixed(1)}\nReturn: $${val.toFixed(1)} (${(val * 100 / cost).toFixed(1)}%)`;
                                    return (
                                        <td className="return-value" title={tooltip} style={{ backgroundColor: bgColor }}>
                                            <Typography variant="body2" align="center" fontSize='inherit'>{showPercent ? PercentageFormatter(val / cost, 0) : val.toFixed(0)}</Typography>
                                        </td>
                                    )
                                })}
                                <td><Typography variant="subtitle2" align="left">{pricePercent(price)}</Typography></td>
                            </tr>
                        ))}
                    </table>
                </div>
            </Grid>
            <Grid item>
                <Typography>*Assumes same IV throughout the time period.</Typography>
            </Grid>
        </Grid>
    )
}