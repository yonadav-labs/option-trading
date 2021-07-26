import React, { useRef, useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Row, Col, Button } from "react-bootstrap";
import { Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";

export default function TradeProfitLossGraph(props) {
    const { trade } = props;
    const chartComponent = useRef(null);
    const [renderDate, setRenderDate] = useState(null);
    const [options, setOptions] = useState({});

    let priceMarks = trade.graph_points['x'];
    let xMin = Math.min(...priceMarks);
    let xMax = Math.max(...priceMarks);
    let plotline_annotations = [];
    let data = [];
    let lastPrice = trade.stock.stock_price;
    let dates = trade.graph_points.y2.map(x => x.date);

    trade.graph_points['x'].forEach((x, i) => {
        let point = {};
        point.x = x;
        point.x2 = (x >= lastPrice ? '+' : '') + (((x - lastPrice) / lastPrice) * 100).toFixed(2); // Stock price change in %.
        point.y = trade.graph_points['y'][i]; // Return in $.
        point.y2 = (point.y >= 0 ? '+' : '') + ((point.y / trade.cost) * 100).toFixed(2); // Return ratio in %.
        data.push(point);
    });

    trade.break_even_prices_and_ratios.forEach(breakeven => {
        plotline_annotations.push({
            color: "green",
            width: 2,
            value: breakeven.price,
            label: {
                rotation: 0,
                y: 45,
                style: {
                    fontStyle: "italic",
                    color: "green",
                },
                text: `Breakeven Price <br /> $${breakeven.price.toFixed(2)}`,
            },
            zIndex: 100,
        });
    });

    // annotation for last price
    plotline_annotations.push({
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
    });

    // Stock share profit/loss data
    let shareData = [];
    if (trade.cost > 0) {
        let totalShares = trade.cost / lastPrice;
        let stockPrice = 0;
        while (stockPrice < lastPrice * 2) {
            stockPrice = stockPrice + lastPrice * 0.01;
            let point = {};
            point.x = stockPrice;
            point.x2 = (stockPrice >= lastPrice ? '+' : '') + (((stockPrice - lastPrice) / lastPrice) * 100).toFixed(2); // Stock price change in %.;
            point.y = totalShares * stockPrice - trade.cost; // Return in $.
            point.y2 = (point.y >= 0 ? '+' : '') + (point.y / trade.cost * 100).toFixed(2); // Return ratio in %.
            shareData.push(point);
        }
    }
    // Stock share profit/loss end

    // Set annotations for price target if they exist    
    if (trade.target_price_lower !== null && trade.target_price_lower === trade.target_price_upper) {
        plotline_annotations.push({
            color: "blue",
            dashStyle: "dash",
            width: 2,
            value: trade.target_price_upper,
            label: {
                rotation: 0,
                y: 105,
                style: {
                    fontStyle: "italic",
                    color: "blue",
                },
                text: `Price Target <br /> $${trade.target_price_upper}`,
            },
            zIndex: 100,
        });
    } else {
        if (trade.target_price_lower) {
            plotline_annotations.push({
                color: "blue",
                dashStyle: "dash",
                width: 2,
                value: trade.target_price_lower,
                label: {
                    rotation: 0,
                    y: 75,
                    style: {
                        fontStyle: "italic",
                        color: "blue",
                    },
                    text: `Lower Price Target <br /> $${trade.target_price_lower}`,
                },
                zIndex: 100,
            });
        }
        if (trade.target_price_upper) {
            plotline_annotations.push({
                color: "blue",
                dashStyle: "dash",
                width: 2,
                value: trade.target_price_upper,
                label: {
                    rotation: 0,
                    y: 105,
                    style: {
                        fontStyle: "italic",
                        color: "blue",
                    },
                    text: `Upper Price Target <br /> $${trade.target_price_upper}`,
                },
                zIndex: 100,
            });
        }
    }

    // FUNCTIONS FOR BUTTONS
    const resetZoom = () => {
        if (chartComponent.current) {
            chartComponent.current.chart.xAxis[0].setExtremes();
            chartComponent.current.chart.yAxis[0].setExtremes();
        }
    };

    const zoomOut = () => {
        if (chartComponent.current) {
            let zoom = chartComponent.current.chart.xAxis[0].getExtremes();
            let zoomMin = zoom.min
            let zoomMax = zoom.max
            if (zoomMin < trade.stock.stock_price * 0.1) {
                zoomMin = 0
            } else {
                zoomMin = zoomMin - trade.stock.stock_price * 0.1
            }
            if (zoomMax > trade.stock.stock_price * 1.9) {
                zoomMax = trade.stock.stock_price * 2
            } else {
                zoomMax = zoomMax + trade.stock.stock_price * 0.1
            }

            chartComponent.current.chart.xAxis[0].setExtremes(zoomMin, zoomMax);
        }
    };

    const zoomIn = () => {
        if (chartComponent.current) {
            let zoom = chartComponent.current.chart.xAxis[0].getExtremes();
            let zoomMin = zoom.min
            let zoomMax = zoom.max
            if (zoomMin < trade.stock.stock_price * 0.9) {
                zoomMin = zoomMin + trade.stock.stock_price * 0.1
            }
            if (zoomMax > trade.stock.stock_price * 1.1) {
                zoomMax = zoomMax - trade.stock.stock_price * 0.1
            }

            chartComponent.current.chart.xAxis[0].setExtremes(zoomMin, zoomMax);
        }
    };
    // END OF FUNCTIONS FOR BUTTONS

    const onRenderDateChange = (date) => {
        setRenderDate(date);
    }

    useEffect(() => {
        let idx = 0;
        if (renderDate) {
            idx = dates.indexOf(renderDate);
        }

        let profitLossData = [];
        trade.graph_points['x'].forEach((x, i) => {
            let point1 = {};
            point1.x = x;
            point1.x2 = (x >= lastPrice ? '+' : '') + (((x - lastPrice) / lastPrice) * 100).toFixed(2); // Stock price change in %.
            point1.y = trade.graph_points['y2'][idx]['data'][i]; // Return in $.
            point1.y2 = (point1.y >= 0 ? '+' : '') + ((point1.y / trade.cost) * 100).toFixed(2); // Return ratio in %.
            profitLossData.push(point1);
        });

        // chart options
        const options_ = {
            credits: {
                enabled: false,
            },
            chart: {
                type: "area",
                zoomType: "x",
                panning: true,
                panKey: "shift",
                resetZoomButton: {
                    theme: {
                        display: 'none'
                    }
                }
            },
            title: {
                text: "Strategy Return",
            },
            subtitle: {
                text: "Click and drag to zoom in. Hold down shift key to pan.",
            },
            legend: {
                enabled: true,
            },
            xAxis: {
                type: "numeric",
                min: xMin,
                max: xMax,
                labels: {
                    formatter: function () {
                        var percentage = `${((this.value - trade.stock.stock_price) / trade.stock.stock_price * 100).toFixed(2)}%`
                        var value = `$${this.value}`
                        return value + '<br/>' + percentage
                    }
                },
                title: {
                    text: "Stock Price",
                },
                plotLines: plotline_annotations,
            },
            yAxis: [
                {
                    title: {
                        text: "Return in $ value"
                    },
                    labels: {
                        format: "${value}",
                    },
                    opposite: true,
                    plotLines: [
                        // annotation for 0
                        {
                            color: "black",
                            width: 2,
                            value: 0,
                            zIndex: 100,
                        },
                    ]
                },
                {
                    title: {
                        text: "Return on selected date",
                    },
                    labels: {
                        formatter: function () {
                            return ((this.value / trade.cost) * 100).toFixed(2) + '%';
                        }
                    },
                    linkedTo: 0,
                },
            ],
            series: [
                {
                    name: "Return at expiration",
                    data: data,
                    marker: {
                        enabled: false,
                    },
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
                                Highcharts.color("#008000")
                                    .setOpacity(0.5)
                                    .get("rgba"),
                            ],
                            [
                                1,
                                Highcharts.color("#008000")
                                    .setOpacity(0.01)
                                    .get("rgba"),
                            ],
                        ],
                    },
                    negativeColor: {
                        linearGradient: {
                            x1: 0,
                            x2: 0,
                            y1: 1,
                            y2: 0,
                        },
                        stops: [
                            [
                                0,
                                Highcharts.color("#FF0000")
                                    .setOpacity(0.5)
                                    .get("rgba"),
                            ],
                            [
                                1,
                                Highcharts.color("#FF0000")
                                    .setOpacity(0.01)
                                    .get("rgba"),
                            ],
                        ],
                    },
                    tooltip: {
                        headerFormat: "",
                        pointFormat: "Stock Price: {point.x2}% (${point.x:,.2f})<br/>Return: {point.y2:,.2f}% (${point.y:,.2f})",
                    },
                },
                {
                    name: "Return today",
                    type: "line",
                    data: profitLossData,
                    marker: {
                        enabled: false,
                    },
                    color: "cyan",
                    description: "Profit Loss",
                    tooltip: {
                        headerFormat: "",
                        pointFormat: "Stock Price: {point.x2}% (${point.x:,.2f})<br/>Return: {point.y2:,.2f}% (${point.y:,.2f})",
                    },
                },
                // line for shares
                {
                    name: "Return of equal value of shares",
                    type: "line",
                    data: shareData,
                    marker: {
                        enabled: false,
                    },
                    color: "#d3d3d3",
                    description: "Shares",
                    tooltip: {
                        headerFormat: "",
                        pointFormat: "Stock Price: {point.x2}% (${point.x:,.2f})<br/>Return: {point.y2:,.2f}% (${point.y:,.2f})",
                    },
                },
            ],
        };

        setOptions(options_);
    }, [trade, renderDate]);

    return (
        <Row className="row justify-content-center" style={{ width: '100%' }}>
            <Col className="mixed-chart">
                <FormControl>
                    <InputLabel id="date-label" style={{ top: 48, left: 68, zIndex: 100 }}>Trade date</InputLabel>
                    <Select
                        label="Trading date"
                        defaultValue={dates[0]}
                        style={{ top: 48, left: 68, zIndex: 100, height: 40 }}
                        onChange={(e) => onRenderDateChange(e.target.value)}
                    >
                        {
                            dates.map((date, idx) => (
                                <MenuItem key={idx} value={date}>{date}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                <Button style={{ position: 'relative', top: 50, left: 100, zIndex: 100 }} onClick={zoomOut}>-</Button>
                <Button style={{ position: 'relative', top: 50, left: 102, zIndex: 100 }} onClick={zoomIn}>+</Button>
                <Button style={{ position: 'relative', top: 50, zIndex: 100 }}
                    className="float-right" onClick={resetZoom}>Reset Zoom</Button>
                <HighchartsReact
                    ref={chartComponent}
                    highcharts={Highcharts}
                    options={options}
                />
            </Col>
        </Row>
    );
}
