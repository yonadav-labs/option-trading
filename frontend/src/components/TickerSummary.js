import React from 'react';
import { TimestampDateFormatter, formatLargeNumber } from '../utils';
import MetricLabel from './MetricLabel.js';
import { Row, Col } from 'react-bootstrap';

export default function TickerSummary({ basicInfo, from }) {
    return (
        <>
            <Row md={from === 'option' ? 2 : 4}>
                <Col sm={3} xs={6}>
                    <MetricLabel label="last price" /><br />
                    {basicInfo.latestPrice ? `$${basicInfo.latestPrice}` : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="day range" /><br />
                    {basicInfo.low && basicInfo.high ?
                        `${basicInfo.low.toFixed(2)}-${basicInfo.high.toFixed(2)}` : "N/A"}

                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="52 week range" /><br />
                    {basicInfo.week52Low && basicInfo.week52High ?
                        `${basicInfo.week52Low.toFixed(2)}-${basicInfo.week52High.toFixed(2)}` : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="market cap" /><br />
                    {basicInfo.marketCap ? `$${formatLargeNumber(basicInfo.marketCap, 1)}` : "N/A"}
                </Col>
            </Row>
            <Row md={from === 'option' ? 2 : 4}>
                <Col sm={3} xs={6}>
                    <MetricLabel label="p/e ratio" /><br />
                    {basicInfo.peRatio ? basicInfo.peRatio.toFixed(2) : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="eps" /><br />
                    {basicInfo.epsTrailingTwelveMonths ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}` : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="earnings date" /><br />
                    {basicInfo.earningsTimestamp && basicInfo.earningsTimestamp > Date.now() / 1000 ?
                        TimestampDateFormatter(basicInfo.earningsTimestamp) : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="dividend date" /><br />
                    {basicInfo.dividendDate && basicInfo.earningsTimestamp > Date.now() / 1000 ?
                        TimestampDateFormatter(basicInfo.dividendDate) : "N/A"}
                </Col>
            </Row>
        </>
    );
}