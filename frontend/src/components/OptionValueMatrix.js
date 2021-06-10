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

export default function OptionValueMatrix({ matrixInfo, stockPrice, cost }) {
    const valRange = matrixInfo.max - matrixInfo.min;

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
        <>
            <h3 className="my-3 text-center">Return by time and stock price</h3>
            <table className="option-matrix mx-auto mb-4" style={{ fontSize: 14.5 }}>
                <tr>
                    <td></td>
                    {matrixInfo.dates.map((date, idx) =>
                        <td key={idx}><strong>{date.substring(0, 5)}</strong></td>
                    )}
                    <td><strong>+/-%</strong></td>
                </tr>
                {matrixInfo.prices.map((price, idx) => (
                    <tr key={idx} className={Math.abs(price - stockPrice) < 0.01 ? 'stock-price' : ''}>
                        <td><strong>${price.toFixed(2)}</strong>&nbsp;</td>
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
                                <td className="text-center return-value" title={tooltip} style={{ backgroundColor: bgColor }}>{val.toFixed(0)}</td>
                            )
                        })}
                        <td className="text-right">&nbsp;<strong>{pricePercent(price)}</strong></td>
                    </tr>
                ))}
            </table>
        </>
    )
}