import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Axios from 'axios';
import getApiUrl from '../utils';
import { useOktaAuth } from '@okta/okta-react';


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
            setTrade(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadTrade();
    }, [authState, authService]);

    return (
        <div className="container">
            <h4>Trade#{tradeId} </h4>
            {trade ? JSON.stringify(trade) : 'Loading...'}
        </div>
    );
}