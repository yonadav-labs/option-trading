import React, { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { Card, Row, Col } from 'react-bootstrap';
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';

import getApiUrl, { PriceFormatter, ProfitFormatter } from '../utils';
import TradeDetailsCard from '../components/cards/TradeDetailsCard';
import TickerSummary from '../components/TickerSummary.js';
import MetricLabel from '../components/MetricLabel.js';

export default function SingleTrade() {
    let { tradeId } = useParams();
    const [trade, setTrade] = useState(null);
    const [broker, setBroker] = useState(null);
    const [currentTrade, setCurrentTrade] = useState(null);
    const [basicInfo, setbasicInfo] = useState(null);
    const [profitLoss, setProfitLoss] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();
    const API_URL = getApiUrl();

    const loadTrade = async () => {
        try {
            let headers = {}
            if (authState.isAuthenticated) {
                const { accessToken } = authState;
                headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken.accessToken}`,
                };
            }

            const response = await Axios.get(`${API_URL}/trade_snapshots/${tradeId}/`, {
                headers: headers
            });

            setTrade(response.data.trade_snapshot);
            setBroker(response.data.broker);
            setbasicInfo(response.data.quote);
            setCurrentTrade(response.data.current_trade_snapshot);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadTrade();
    }, [oktaAuth, authState]);

    useEffect(() => {
        if (currentTrade) {
            let profit = currentTrade.cost - trade.cost;
            let profit_rate = profit / trade.cost;
            let stock_profit_rate = currentTrade.stock.stock_price / trade.stock.stock_price - 1;
            setProfitLoss({ profit, profit_rate, stock_profit_rate });
        }
    }, [trade, currentTrade]);

    return (
        <div id="content" className="container min-vh-100" style={{ "marginTop": "4rem" }}>
            {trade ? (
                <div>
                    <h4>{trade.display_name}</h4>
                    <p>Find your own options trading ideas through our <Link to="/strategy-screener" role="button">Strategy Screener</Link> now!</p>
                    <TradeDetailsCard trade={trade} hideShareButton={true} hideTitle={true} broker={broker} />
                </div>
            ) : 'Loading...'}
            {
                basicInfo &&
                <>
                    <h4 className="mt-4">{trade.stock.ticker.symbol} details</h4>
                    <Card className="mb-4 mt-3">
                        <Card.Body>
                            <TickerSummary basicInfo={basicInfo} />
                        </Card.Body>
                    </Card>
                </>
            }
            {
                profitLoss &&
                <>
                    <h4 className="mt-4">Latest performance</h4>
                    <Card className="mb-4 mt-3">
                        <Card.Body>
                            <Row md="4">
                                <Col sm={3} xs={6}>
                                    <MetricLabel label="latest return" />
                                    <div> {PriceFormatter(profitLoss.profit)} ({ProfitFormatter(profitLoss.profit_rate)})</div>
                                </Col>
                                <Col sm={3} xs={6}>
                                    <MetricLabel label="initial value" />
                                    <div> {PriceFormatter(trade.cost)} </div>
                                </Col>
                                <Col sm={3} xs={6}>
                                    <MetricLabel label="latest value" />
                                    <div> {PriceFormatter(currentTrade.cost)} </div>
                                </Col>
                                <Col sm={3} xs={6}>
                                    <MetricLabel label="latest stock return" />
                                    <div> {ProfitFormatter(profitLoss.stock_profit_rate)}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </>
            }
        </div>
    );
}