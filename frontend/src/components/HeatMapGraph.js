import React, { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import HighchartsReact from "highcharts-react-official";
import { Row, Col } from "react-bootstrap";

HighchartsHeatmap(Highcharts);

function getPointCategoryName(point, dimension) {
    var series = point.series,
        isY = dimension === 'y',
        axis = series[isY ? 'yAxis' : 'xAxis'];
    return axis.categories[point[isY ? 'y' : 'x']];
}

export default function HeatMapGraph(props) {
    const { title, className, zLabel, data } = props;
    const chartComponent = useRef(null);

    const chartHeight = Math.max(Math.min(data.strike_prices.length * 18, 12000), 400);

    // chart options
    const options = {
        credits: {
            enabled: false,
        },
        chart: {
            type: 'heatmap',
            marginTop: 80,
            marginBottom: 100,
            plotBorderWidth: 0,
            height: chartHeight
        },
        title: {
            text: title
        },
        xAxis: [{
            categories: data.expiration_dates,
        }, {
            categories: data.expiration_dates,
            title: { text: 'Expiration Date' },
            opposite: true,
            linkedTo: 0
        }],
        yAxis: {
            categories: data.strike_prices,
            title: { text: 'Strike' },
            reversed: true
        },
        colorAxis: {
            min: 0,
            minColor: '#ccffdd',
            maxColor: '#ff9999'
        },
        legend: {
            enabled: false,
        },
        tooltip: {
            formatter: function () {
                let zValue = data.data.find(x => x[0] == this.point.x && x[1] == this.point.y);
                let iv = (zValue[2]['Implied Volatility'] * 100.0).toFixed(2) + '%';
                let oi = zValue[2]['Open Interest'];
                let vol = zValue[2]['Volume'];
                let apr = (zValue[2]['apr'] ? (zValue[2]['apr'] * 100.0).toFixed(2) + '%' : 'Empty');
                let p_otm = (zValue[2]['p_otm'] * 100.0).toFixed(2) + '%';

                let text = 'Expiration Date: <b>' + getPointCategoryName(this.point, 'x') + '</b><br>' +
                    'Strike price: <b>' + getPointCategoryName(this.point, 'y') + '</b><br>' +
                    'Implied Volatility: <b>' + iv + '</b><br>' +
                    'Open Interest: <b>' + oi + '</b><br>' +
                    'Volume: <b>' + vol + '</b><br>' +
                    'Annualized Premium Profit if OTM: <b>' + apr + '</b><br>' +
                    'Probability of OTM: <b>' + p_otm + '</b>';
                return text;
            }
        },
        series: [{
            borderWidth: 0,
            data: data.data.map(x => ([
                x[0], x[1], x[2][zLabel]
            ])),
            dataLabels: {
                enabled: true,
                color: '#000000',
                formatter: function () {
                    if (zLabel == 'apr') {
                        if (this.point.value) {
                            return (this.point.value * 100.0).toFixed(2) + '%';
                        }
                    }
                    if (zLabel == 'Implied Volatility') {
                        if (this.point.value) {
                            return (this.point.value * 100.0).toFixed(2) + '%';
                        }
                    }
                    return this.point.value;
                }
            }
        }]
    }

    return (
        <Row className="row justify-content-center">
            <Col className={className}>
                <HighchartsReact
                    ref={chartComponent}
                    highcharts={Highcharts}
                    options={options}
                />
            </Col>
        </Row>
    );
}
