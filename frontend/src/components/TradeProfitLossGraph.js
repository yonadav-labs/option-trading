import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Button, Row, Col } from "react-bootstrap";

export default function TradeProfitLossGraph(props) {
    const { trade } = props;
    let priceMarks = [trade.break_even_price, trade.stock.stock_price]
    if (trade.target_price_lower !== null) {
        priceMarks.push(trade.target_price_lower);
    }
    if (trade.target_price_upper !== null) {
        priceMarks.push(trade.target_price_upper);
    }
    let xMin = Math.min(...priceMarks) * 0.9;
    let xMax = Math.max(...priceMarks) * 1.1;
    let lowerTargetAnnotation = {}
    let upperTargetAnnotation = {}
    let data = [];

    trade.graph_x_points.forEach((x, i) => {
        let point = {};
        point.x = x;
        point.y = trade.graph_y_points[i];
        data.push(point);
    });

    // set annotations for target price if the exist
    if (trade.target_price_lower !== null) {
        lowerTargetAnnotation = {
            color: "blue",
            dashStyle: "dash",
            width: 2,
            value: trade.target_price_lower,
            label: {
                rotation: 0,
                y: 75,
                style: {
                    fontStyle: "italic",
                },
                text: `Lower Target Price <br /> $${trade.target_price_lower}`,
            },
            zIndex: 100,
        };
    }
    if (trade.target_price_upper !== null) {
        upperTargetAnnotation = {
            color: "blue",
            dashStyle: "dash",
            width: 2,
            value: trade.target_price_upper,
            label: {
                rotation: 0,
                y: 105,
                style: {
                    fontStyle: "italic",
                },
                text: `Upper Target Price <br /> $${trade.target_price_upper}`,
            },
            zIndex: 100,
        };
    }

    // chart options
    const options = {
        credits: {
            enabled: false
        },
        chart: {
            type: "line",
            zoomType: "xy",
            panning: true,
            panKey: "shift",
        },
        title: {
            text: "Profit/Loss Graph",
        },
        subtitle: {
            text: "Click and drag to zoom in. Hold down shift key to pan.",
        },
        legend: {
            enabled: false,
        },
        xAxis: {
            type: "numeric",
            min: xMin,
            max: xMax,
            title: {
                text: "Stock Price",
            },
            plotLines: [
                // annotation for breakeven
                {
                    color: "green",
                    width: 2,
                    value: trade.break_even_price,
                    label: {
                        rotation: 0,
                        y: 45,
                        style: {
                            fontStyle: "italic",
                            color: "green",
                        },
                        text: `Breakeven Price <br /> $${trade.break_even_price}`,
                    },
                    zIndex: 100,
                },
                // annotation for last price
                {
                    color: "black",
                    width: 2,
                    value: trade.stock.stock_price,
                    label: {
                        rotation: 0,
                        y: 15,
                        style: {
                            fontStyle: "italic",
                        },
                        text: `Last Price <br /> $${trade.stock.stock_price}`,
                    },
                    zIndex: 100,
                },
                // annotation for lower target price
                lowerTargetAnnotation,
                // annotation for upper target price
                upperTargetAnnotation,
            ],
        },
        yAxis: {
            title: {
                text: "Profit/Loss",
            },
            labels: {
                format: "${value}",
            },
            plotLines: [
                // annotation for 0
                {
                    color: "black",
                    width: 2,
                    value: 0,
                    zIndex: 100,
                },
            ],
        },
        tooltip: {
            headerFormat: "Stock Price: ${point.x:,.2f} <br/>",
            pointFormat: "Profit/Loss: ${point.y:,.2f}",
        },
        series: [
            {
                name: "Profit",
                data: data,
                marker: {
                    enabled: false,
                },
                color: "#00ff50",
                negativeColor: "#ff0050",
            },
        ],
    };

    return (
        <Row className="row justify-content-center">
            <Col className="mixed-chart">
                <HighchartsReact highcharts={Highcharts} options={options} />
            </Col>
        </Row>
    );
}
