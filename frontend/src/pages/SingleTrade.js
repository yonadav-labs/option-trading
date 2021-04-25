import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { Card } from 'react-bootstrap';
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';

import getApiUrl from '../utils';
import TradeDetailsCard from '../components/cards/TradeDetailsCard';
import TickerSummary from '../components/TickerSummary.js';

export default function SingleTrade() {
    let { tradeId } = useParams();
    const [trade, setTrade] = useState(null);
    const [broker, setBroker] = useState(null);
    const [latestTrade, setLatestTrade] = useState(null);
    const [basicInfo, setbasicInfo] = useState(null);
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
            setLatestTrade(response.data.current_trade_snapshot);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadTrade();
    }, [oktaAuth, authState]);

    return (
        <div id="content" className="container min-vh-100" style={{ "marginTop": "4rem" }}>
            <Helmet>
                <title>Tigerstance | Saved Trade</title>
            </Helmet>
            {trade ? (
                <div>
                    <h4>{trade.display_name}</h4>
                    <h5><Link to="/discover" role="button">Discover</Link> your own options trading ideas now!</h5>
                    <TradeDetailsCard trade={trade} latestTrade={latestTrade} hideShareButton={true} hideTitle={true} broker={broker} />
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
        </div>
    );
}