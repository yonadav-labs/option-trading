import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function GraphSummary({ trade }) {
    let data = [];

    trade.graph_points['x'].forEach((x, i) => {
        let point = {};
        point.x = x;
        point.y = trade.graph_points['y'][i];
        data.push(point);
    });

    // fix this with break evens
    let colorBreakpoint = (trade.break_even_prices_and_ratios[0].price / trade.stock.stock_price)
    let backgroundColor = {}
    if (data[0].y < 0) {
        backgroundColor = {
            linearGradient: { x1: 0, x2: colorBreakpoint, y1: 0, y2: 0 },
            stops: [
                [0, 'rgba(220, 53, 69, 0.1)'],
                [1, 'rgba(39, 166, 154, 0.1)']
            ]
        }
    } else {
        backgroundColor = {
            linearGradient: { x1: 0, x2: colorBreakpoint, y1: 0, y2: 0 },
            stops: [
                [0, 'rgba(39, 166, 154, 0.1)'],
                [1, 'rgba(220, 53, 69, 0.1)']
            ]
        }
    }


    // chart options
    const options = {
        chart: {
            height: 100,
            backgroundColor: backgroundColor,
            margin: [0, 0, 0, 0]
        },
        title: {
            text: null
        },
        credits: {
            enabled: false,
        },
        legend: {
            enabled: false,
        },
        plotOptions: {
            series: {
                animation: false,
                marker: {
                    enabled: false,
                },
                states: {
                    hover: {
                        enabled: false,
                    },
                },
                lineWidth: 5,
            },
        },
        tooltip: { enabled: false },
        xAxis: {
            visible: false,
        },
        yAxis: {
            visible: false,
        },
        series: [
            {
                data: data,
                color: {
                    // change x gradient based on +/- slope
                    linearGradient: {
                        x1: 0,
                        x2: 0,
                        y1: 0,
                        y2: 1,
                    },
                    stops: [
                        [
                            0,
                            "rgba(39, 166, 154, 0.7)"
                        ],
                        [
                            1,
                            "rgba(220, 53, 69, 0.7)"
                        ],
                    ],
                },
            },
        ],
    };

    return (
        <div style={
            {
                position: "absolute",
                width: "100%"
            }
        }>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                style={{ width: "100%", display: "block" }}
            />
        </div>
    );
}
