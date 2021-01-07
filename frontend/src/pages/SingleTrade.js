import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';

import getApiUrl from '../utils';
import TradeDetailsCard from '../components/TradeDetailsCard';


export default function SingleTrade() {
    let { tradeId } = useParams();
    const [trade, setTrade] = useState(null);
    const { authState, authService } = useOktaAuth();
    const API_URL = getApiUrl();

    const loadTrade = async () => {
        try {
            let headers = {}
            if (authState.isAuthenticated) {
                const { accessToken } = authState;
                headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                };
            }

            const response = await Axios.get(`${API_URL}/trade_snapshots/${tradeId}`, {
                headers: headers
            });
            setTrade(response.data.trade_snaphost);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadTrade();
    }, [authState, authService]);

    return (
        <div id="content" className="container min-vh-100" style={{ "marginTop": "4rem" }}>
            {trade ? <TradeDetailsCard trade={trade}></TradeDetailsCard> : 'Loading...'}
        </div>
    );
}