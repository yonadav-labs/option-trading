import React, { useRef } from "react";
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
    const { title, className, zLabel, data, expirationDates, strikePrices } = props;
    const chartComponent = useRef(null);

    const chartHeight = Math.max(Math.min(strikePrices.length * 18, 12000), 400);
    // chart options
    const options = {
        credits: {
            enabled: false,
        },
        chart: {
            type: 'heatmap',
            // zoomType: "xy",
            // panning: true,
            // panKey: "shift",
            marginTop: 42,
            marginBottom: 38,
            plotBorderWidth: 0,
            height: chartHeight
        },
        title: {
            text: title
        },
        // subtitle: {
        //     text: "Click and drag to zoom in. Hold down shift key to pan.",
        // },
        xAxis: {
            categories: expirationDates
        },
        yAxis: {
            categories: strikePrices,
            title: null,
            reversed: true
        },
        colorAxis: {
            min: 0,
            minColor: '#ccffdd',
            maxColor: '#ff9999'
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: chartHeight - 80
        },
        tooltip: {
            formatter: function () {
                return 'Expiration Date: <b>' + getPointCategoryName(this.point, 'x') +
                    '</b><br>Strike price: <b>$' + getPointCategoryName(this.point, 'y') +
                    '</b><br>' + zLabel + ':<b>' + this.point.value + '</b>';
            }
        },
        series: [{
            borderWidth: 0,
            data: data,
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
