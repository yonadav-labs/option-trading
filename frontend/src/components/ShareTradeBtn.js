import React, { useState } from 'react';
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon } from "react-share";
import getApiUrl, { GetGaEventTrackingFunc } from '../utils';
import ShareIcon from '@material-ui/icons/Share';
import { ClickAwayListener, Grid, IconButton, Tooltip } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';

const GaEvent = GetGaEventTrackingFunc('save trade');

export default function ShareTradeBtn(props) {
    const { trade } = props;
    const { authState } = useOktaAuth();
    const [shareLink, setShareLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const API_URL = getApiUrl();

    function ConvertToTradeSnapshot() {
        let tradeSnapshot = {
            type: trade.type,
            stock_snapshot: {
                ticker_id: trade.stock.ticker.id,
                external_cache_id: trade.stock.external_cache_id,
                ticker_stats_id: trade.stock.ticker_stats_id
            },
            leg_snapshots: [],
            is_public: true,
            premium_type: trade.premium_type,
            target_price_lower: trade.target_price_lower,
            target_price_upper: trade.target_price_upper,
        };
        trade.legs.map((leg) => {
            let legSnapshot = { is_long: leg.is_long, units: leg.units }
            if (leg.contract) {
                let contract = {
                    ticker_id: leg.contract.ticker.id,
                    external_cache_id: leg.contract.external_cache_id,
                    is_call: leg.contract.is_call,
                    strike: leg.contract.strike,
                    expiration_timestamp: leg.contract.expiration,
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
            let url = `${API_URL}/trade_snapshots`;
            let headers = {
                'Content-Type': 'application/json',
            }
            if (authState.isAuthenticated) {
                const { accessToken } = authState;
                headers['Authorization'] = `Bearer ${accessToken.accessToken}`
            }
            const response = await Axios.post(url, tradeSnapshot, {
                headers: headers
            });
            setShareLink('/t/' + response.data.id);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
        GaEvent('share trade');
    }

    function ShareTrade(e) {
        if (e) {
            e.stopPropagation();
        }
        if (isLoading) {
            // Prevent multiple clicks.
            return;
        }
        setIsLoading(true);
        const tradeSnapshot = ConvertToTradeSnapshot();
        SaveTradeSnaphot(tradeSnapshot);
    }

    const copyLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText('www.tigerstance.com' + shareLink);
        setTooltipOpen(true);
    }

    return (
        (
            <div>
                {
                    (shareLink && !isLoading) ?
                        <Grid container item>
                            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                                <FacebookShareButton
                                    url={`www.tigerstance.com${shareLink}`}
                                    quote={'Check out this trade I discovered on #tigerstance!'}
                                >
                                    <FacebookIcon size="45" round={true} />
                                </FacebookShareButton>
                            </IconButton>
                            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                                <TwitterShareButton
                                    url={`www.tigerstance.com${shareLink}`}
                                    title={'Check out this trade I discovered on #tigerstance!'}
                                    via={'TheTigerStance'}
                                >
                                    <TwitterIcon size="45" round={true} />
                                </TwitterShareButton>
                            </IconButton>
                            <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
                                <div>
                                    <Tooltip
                                        PopperProps={{
                                            disablePortal: true,
                                        }}
                                        onClose={() => setTooltipOpen(false)}
                                        open={tooltipOpen}
                                        disableFocusListener
                                        disableHoverListener
                                        disableTouchListener
                                        title="Link copied to clipboard"
                                    >
                                        <IconButton onClick={copyLink}><LinkIcon /></IconButton>
                                    </Tooltip>
                                </div>

                            </ClickAwayListener>
                        </Grid>
                        :
                        <IconButton onClick={ShareTrade}><ShareIcon /></IconButton>
                }
            </div >
        )
    );
}