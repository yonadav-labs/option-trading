import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function GraphSummary({ trade }) {
    let data = [];
    let x_plotbands = [];
    let plotband_start_index = null;

    trade.graph_points['x'].forEach((x, i) => {
        let point = {};
        point.x = x;
        point.y = trade.graph_points['y'][i];
        point.color = point.y >= 0 ? "rgba(39, 166, 154, 0.7)" : "rgba(220, 53, 69, 0.7)";
        if (plotband_start_index === null) {
            plotband_start_index = i;
        } else {
            if ((trade.graph_points['y'][plotband_start_index] >= 0 && point.y < 0) || (trade.graph_points['y'][plotband_start_index] < 0 && point.y >= 0) || i === trade.graph_points['x'].length - 1) {
                x_plotbands.push({
                    color: trade.graph_points['y'][plotband_start_index] >= 0 ? 'rgba(39, 166, 154, 0.1)' : 'rgba(220, 53, 69, 0.1)', // Color value
                    from: trade.graph_points['x'][plotband_start_index], // Start of the plot band
                    to: point.x // End of the plot band
                });
                plotband_start_index = i;
            }
        }
        data.push(point);
    });

    // chart options
    const options = {
        chart: {
            height: 100,
            margin: [0, -15, 0, -15],
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
            visible: true,
            plotBands: x_plotbands,
        },
        yAxis: {
            visible: false,
        },
        series: [
            {
                data: data,
                color: "rgba(39, 166, 154, 0.7)",
                negativeColor: "rgba(220, 53, 69, 0.7)"
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
