import React, { useEffect, useState } from 'react';
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
            setbasicInfo(response.data.quote);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadTrade();
    }, [oktaAuth, authState]);

    return (
        <div id="content" className="container min-vh-100" style={{ "marginTop": "4rem" }}>
            {trade ? (
                <div>
                    <h4>{trade.display_name}</h4>
                    <p>Find your own options trading ideas through our <Link to="/strategy-screener" role="button">Strategy Screener</Link> now!</p>
                    <TradeDetailsCard trade={trade} hideShareButton={true} hideTitle={true} ></TradeDetailsCard>
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