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
            marginTop: 42,
            marginBottom: 150,
            plotBorderWidth: 0,
            height: chartHeight
        },
        title: {
            text: title
        },
        xAxis: {
            categories: data.expiration_dates,
            title: { text: 'Expiration Date' },
        },
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
                return 'Expiration Date: <b>' + getPointCategoryName(this.point, 'x') +
                    '</b><br>Strike price: <b>' + getPointCategoryName(this.point, 'y') +
                    '</b><br>Implied Volatility:<b>' + zValue[2]['Implied Volatility'] + 
                    '</b><br>Open Interest:<b>' + zValue[2]['Open Interest'] + 
                    '</b><br>Volume:<b>' + zValue[2]['Volume'] + '</b>';
            }
        },
        series: [{
            borderWidth: 0,
            data: data.data.map(x => ([
                x[0], x[1], x[2][zLabel]
            ])),
            dataLabels: {
                enabled: true,
                color: '#000000'
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
