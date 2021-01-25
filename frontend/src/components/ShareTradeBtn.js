import React, { useState } from 'react';
import Axios from 'axios';
import { FaShare } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { useOktaAuth } from '@okta/okta-react';

import getApiUrl from '../utils';

export default function ShareTradeBtn(props) {
    const { trade } = props;
    const { authState, authService } = useOktaAuth();
    const [shareLink, setShareLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = getApiUrl();

    function ConvertToTradeSnapshot() {
        let tradeSnapshot = {
            type: trade.type,
            stock_snapshot: { ticker_id: trade.stock.ticker.id, external_cache_id: trade.stock.external_cache_id },
            leg_snapshots: [],
            is_public: true,
            target_price_lower: trade.target_price_lower,
            target_price_upper: trade.target_price_upper,
        };
        trade.legs.map((leg, index) => {
            let legSnapshot = { is_long: leg.is_long, units: leg.units }
            if (leg.contract) {
                let contract = {
                    ticker_id: leg.contract.ticker.id,
                    external_cache_id: leg.contract.external_cache_id,
                    is_call: leg.contract.is_call,
                    strike: leg.contract.strike,
                    expiration_timestamp: leg.contract.expiration,
                    premium: leg.contract.premium,
                }
                legSnapshot.contract_snapshot = contract;
            } else if (leg.stock) {
                legSnapshot.stock_snapshot = {
                    ticker_id: leg.stock.ticker.id,
                    external_cache_id: leg.stock.external_cache_id,
                };
            } else {
                legSnapshot.cash_snapshot = true;
            }
            tradeSnapshot.leg_snapshots.push(legSnapshot);
        })
        return tradeSnapshot;
    }

    const SaveTradeSnaphot = async (tradeSnapshot) => {
        try {
            const { accessToken } = authState;
            let url = `${API_URL}/trade_snapshots`;
            const response = await Axios.post(url, tradeSnapshot, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            setShareLink('/t/' + response.data.id);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    function ShareTrade(e) {
        e.stopPropagation();
        if (isLoading) {
            // Prevent multiple clicks.
            return;
        }
        setIsLoading(true);
        const tradeSnapshot = ConvertToTradeSnapshot();
        SaveTradeSnaphot(tradeSnapshot);
    }

    return (
        (
            <div>
                {authState.isAuthenticated ? shareLink ?
                    <span><FaShare /> Share:&nbsp;
                        <Link style={{ "cursor": "pointer" }} to={shareLink} onClick={(e) => { e.stopPropagation() }} target="_blank">
                            www.tigerstance.com{shareLink}
                        </Link>
                    </span> :
                    <div style={{ "cursor": "pointer" }} onClick={ShareTrade}><FaShare /> Share</div>
                    : <Link className="btn btn-primary mr-3 text-light" to="/signin">Sign in to share</Link>
                }
            </div >
        )
    );
}