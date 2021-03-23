import React, { useContext, useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import UserContext from '../UserContext';
import getApiUrl, { TimestampDateFormatter, formatLargeNumber } from '../utils';
import Axios from 'axios';
import TradingWidget from './TradingWidget';
import MetricLabel from './MetricLabel.js';

// Bootstrap
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { Row, Col, Badge } from 'react-bootstrap';

export default function TickerSummary({ basicInfo, from }) {
    /*
    const { user, setUser } = useContext(UserContext);
    const [onWatchlist, setOnWatchlist] = useState(user ? user.watchlist.includes(basicInfo.symbol) : false);
    const API_URL = getApiUrl();
    useEffect(() => {
        setOnWatchlist(user ? user.watchlist.includes(basicInfo.symbol) : false);
    }, [basicInfo]);
    const updateWatchlist = async () => {
        try {
            if (onWatchlist) {
                const newWatchlist = user.watchlist.filter(item => item !== basicInfo.symbol);
                user.watchlist = newWatchlist;
            } else {
                user.watchlist.push(basicInfo.symbol);
            }
            console.log(user);
            const response = await Axios.put(`${API_URL}/users/${user.okta_id}`, user);
            setUser(response.data, setOnWatchlist(user.watchlist.includes(basicInfo.symbol)));
        } catch (error) {
            console.error(error);
        }
    };
    */

    return (
        <>
            <Row md={from === 'option' ? 2 : 4}>
                <Col sm={3} xs={6}>
                    <MetricLabel label="last price" />
                    {basicInfo.regularMarketPrice ? `$${basicInfo.regularMarketPrice}` : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="day range" />

                    {basicInfo.regularMarketDayLow && basicInfo.regularMarketDayHigh ?
                        `${basicInfo.regularMarketDayLow.toFixed(2)}-${basicInfo.regularMarketDayHigh.toFixed(2)}` : "N/A"}

                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="52 week range" />
                    {basicInfo.fiftyTwoWeekLow && basicInfo.fiftyTwoWeekHigh ?
                        `${basicInfo.fiftyTwoWeekLow.toFixed(2)}-${basicInfo.fiftyTwoWeekHigh.toFixed(2)}` : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="market cap" />
                    {basicInfo.marketCap ? `$${formatLargeNumber(basicInfo.marketCap, 1)}` : "N/A"}
                </Col>
            </Row>
            <Row md={from === 'option' ? 2 : 4}>
                <Col sm={3} xs={6}>
                    <MetricLabel label="p/e ratio" />
                    {basicInfo.trailingPE ? basicInfo.trailingPE.toFixed(2) : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="eps" />
                    {basicInfo.epsTrailingTwelveMonths ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}` : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="earnings date" />
                    {basicInfo.earningsTimestamp && basicInfo.earningsTimestamp > Date.now() / 1000 ?
                        TimestampDateFormatter(basicInfo.earningsTimestamp) : "N/A"}
                </Col>
                <Col sm={3} xs={6}>
                    <MetricLabel label="dividend date" />
                    {basicInfo.dividendDate && basicInfo.earningsTimestamp > Date.now() / 1000 ?
                        TimestampDateFormatter(basicInfo.dividendDate) : "N/A"}
                </Col>
            </Row>
        </>
    );
}