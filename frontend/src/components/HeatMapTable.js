import { Typography } from "@material-ui/core";
import React from "react";

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

export default function HeatMapTable({ className, zLabel, data, contractType, stockPrice }) {
    if (!data) { return <div></div> }

    const valRange = data.min_max[zLabel].max - data.min_max[zLabel].min;
    const midVal = (data.min_max[zLabel].max + data.min_max[zLabel].min) / 2;

    const gradient = [
        [
            data.min_max[zLabel].min,
            [0, 225, 0]
        ],
        [
            midVal,
            [255, 255, 0]
        ],
        [
            data.min_max[zLabel].max,
            [225, 0, 0]
        ]
    ];

    const strikePrices = data.strike_prices.map(x => parseFloat(x.replace(/[^0-9.]/g, '')));
    var closestStrike = strikePrices.reduce((prev, curr) => {
        return (Math.abs(curr - stockPrice) < Math.abs(prev - stockPrice) ? curr : prev);
    });
    const closestStrikeIdx = strikePrices.findIndex(x => x == closestStrike);

    return (
        <>
            <Typography variant="h6" align="center" gutterBottom>Expiration Date</Typography>
            <div style={{ width: '100%' }}>
                <table className="heatmap-matrix" style={{ width: '100%' }}>
                    <tr>
                        <td><Typography variant="h6" align="center">Strike</Typography></td>
                        {data.expiration_dates.map((date, idx) =>
                            <td key={idx}><Typography variant="subtitle2" align="center">{date}</Typography></td>
                        )}
                    </tr>
                    {data.strike_prices.map((price, idx) => (
                        <tr key={idx} className={closestStrikeIdx == idx ? 'stock-price' : ''}>
                            <td><Typography variant="subtitle2" align="center">{price}</Typography></td>
                            {data.values[idx].map((cell, index) => {
                                if (!cell) { return <td></td> }

                                let val = cell[zLabel];
                                if (!val) { return <td></td> }

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
                                bgColor = 'rgba(' + bgColor.join() + ', 0.5)';

                                let iv = (cell['Implied Volatility'] * 100.0).toFixed(2) + '%';
                                let oi = cell['Open Interest'];
                                let vol = cell['Volume'];
                                let apr = (cell['apr'] ? (cell['apr'] * 100.0).toFixed(2) + '%' : 'Empty');
                                let p_otm = (cell['p_otm'] * 100.0).toFixed(2) + '%';
                                let vol_per_pi = cell['vol_per_oi'] != null ? (cell['vol_per_oi'] * 100.0).toFixed(2) + '%' : 'Empty';
                                let mark = `$${cell['mark'].toFixed(2)}`;
                                let bid = `$${cell['bid'].toFixed(2)}`;
                                let ask = `$${cell['ask'].toFixed(2)}`;

                                let tooltip = data.expiration_dates[index] + ' ' + price + ' ' +
                                    contractType.charAt(0).toUpperCase() + contractType.slice(1) + '\n' +
                                    'Bid: ' + bid + '\n' +
                                    'Ask: ' + ask + '\n' +
                                    'Mark: ' + mark + '\n' +
                                    'Implied Volatility: ' + iv + '\n' +
                                    'Open Interest: ' + oi + '\n' +
                                    'Volume: ' + vol + '\n' +
                                    'VOL/OI: ' + vol_per_pi + '\n' +
                                    'Annualized Premium Profit if OTM: ' + apr + '\n' +
                                    'Probability of OTM: ' + p_otm;

                                let valDisplay = val;
                                if (zLabel == 'apr' || zLabel == 'Implied Volatility' || zLabel == 'vol_per_oi') {
                                    if (val) {
                                        valDisplay = (val * 100.0).toFixed(2) + '%';
                                    }
                                } else if (zLabel == 'bid' || zLabel == 'ask' || zLabel == 'mark') {
                                    if (val) {
                                        valDisplay = '$' + val.toFixed(2);
                                    }
                                }

                                return (
                                    <td className="value-cell" title={tooltip} style={{ backgroundColor: bgColor }}>
                                        <Typography variant="body2" align="center">{valDisplay}</Typography>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    <tr>
                        <td></td>
                        {data.expiration_dates.map((date, idx) =>
                            <td key={idx}><Typography variant="subtitle2" align="center">{date}</Typography></td>
                        )}
                    </tr>
                </table>
            </div>
        </>
    )
}