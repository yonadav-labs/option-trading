import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';
import getApiUrl, { PriceFormatter, ProfitFormatter, TimestampDateFormatter } from '../utils';
import TradeDetailsCard from '../components/cards/TradeDetailsCard';
import TickerSummary from '../components/TickerSummary.js';
import { Card, CardHeader, CardContent, Grid, Typography, Button, Box } from '@material-ui/core';
import MetricLabel from '../components/MetricLabel';
import { startCase } from 'lodash';

export default function SingleTrade() {
    let { tradeId } = useParams();
    const [trade, setTrade] = useState(null);
    const [broker, setBroker] = useState(null);
    const [latestTrade, setLatestTrade] = useState(null);
    const [pastTrade, setPastTrade] = useState(null);
    const [basicInfo, setbasicInfo] = useState(null);
    const [buttonColor, setButtonColor] = useState("rgba(0, 0, 0, 0.87)");
    const { oktaAuth, authState } = useOktaAuth();
    const API_URL = getApiUrl();

    let profitLoss;
    if (trade) {
        let profit = latestTrade.cost - pastTrade.cost;
        let profit_rate = profit / pastTrade.cost;
        let stock_profit_rate = latestTrade.stock.stock_price / pastTrade.stock.stock_price - 1;
        profitLoss = { profit, profit_rate, stock_profit_rate };
    }



    const loadTrade = async () => {
        try {
            console.log("loading trade........")
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

            setPastTrade(response.data.trade_snapshot);
            setBroker(response.data.broker);
            setbasicInfo(response.data.quote);
            setLatestTrade(response.data.current_trade_snapshot);
            setTrade(response.data.current_trade_snapshot);
        } catch (error) {
            console.error(error);
        }
    };

    const GenerateTradeTitle = (trade) => {
        let call_strikes = [];
        let put_strikes = [];
        let expirations = [];
        let exps = new Set();
        trade.legs.forEach(leg => {
            if (leg.contract) {
                const contract = leg.contract;
                exps.add(contract.expiration);
                if (contract.is_call) {
                    call_strikes.push(contract.strike);
                } else {
                    put_strikes.push(contract.strike);
                }
            }
            expirations = Array.from(exps).sort();
        });
        return (
            <Grid container direction="column" align="center">
                <Typography variant="h2">
                    {trade.stock.ticker.symbol}&nbsp;
                    {expirations.map(exp => <span key={exp}>{TimestampDateFormatter(exp)} </span>)}
                </Typography>
                <Typography variant="body1">
                    {call_strikes.map((strike, idx) => idx === call_strikes.length - 1 ? `$${strike} Calls` : `$${strike}/`)}
                    {put_strikes.map((strike, idx) => idx === put_strikes.length - 1 ? `$${strike} Puts` : `$${strike}/`)}:&nbsp;
                    {startCase(trade.type)} with&nbsp;
                    {trade.net_debit_per_unit >= 0 ? `$${Math.abs(trade.net_debit_per_unit)} net Debit` : `$${Math.abs(trade.net_debit_per_unit)} net Credit`}
                </Typography>
            </Grid>
        );
    }

    const onChangePastTrade = () => {
        if (trade === latestTrade) {
            setTrade(pastTrade);
        }
        else if (trade === pastTrade) {
            setTrade(latestTrade);
        }
    }

    const onMouseEnter = () => {
        setButtonColor("linear-gradient(90deg, #FF8F2B 0%, #FFD43A 100%)");
    }
    const onMouseExit = () => {
        setButtonColor("rgba(0, 0, 0, 0.87)")
    }

    useEffect(() => {
        if (authState.isAuthenticated) {
            loadTrade();
        }
    }, [oktaAuth, authState]);


    return (
        <Grid container direction="row" justifyContent="center" id="content" style={{ mt: "4rem" }}>
            <Helmet>
                <title>Tigerstance | Saved Trade</title>
            </Helmet>
            {trade ? (
                <Grid item sx={{ mb: 4, mt: 3 }} sm={10} xs={11}>
                    <Grid container direction="column" sx={{ justifyContent: "center" }}>
                        <Grid item align="center">
                            Shared Trade
                        </Grid>
                        <Grid item>
                            {GenerateTradeTitle(trade)}
                        </Grid>
                        <Box sx={{ borderRadius: "30px", border: "1px solid #E4E4E4", width: "335px", justifyContent: "center", margin: "auto", mt: 4 }} >
                            {trade === pastTrade ? <Grid item align="center" sx={{ borderRadius: "30px", py: "5px" }}>
                                <Button variant="text" onClick={onChangePastTrade} sx={{ borderRadius: "30px" }}>
                                    <Typography variant="subtitle1" onMouseEnter={onMouseEnter} onMouseLeave={onMouseExit} color={buttonColor}>Current Trade</Typography>
                                </Button>
                                <Button variant="contained" sx={{ borderRadius: "30px", background: "rgba(0, 0, 0, 0.87)" }}>
                                    <Typography variant="subtitle1">Past Trade</Typography>
                                </Button>
                            </Grid>
                                : <Grid container direction="row" justifyContent="center" sx={{ borderRadius: "30px", p: "5px" }}>
                                    <Grid item>
                                        <Button variant="contained" sx={{ borderRadius: "30px", background: "rgba(0, 0, 0, 0.87)" }}>
                                            <Typography variant="subtitle1">Current Trade</Typography>
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="text" onClick={onChangePastTrade} sx={{ borderRadius: "30px" }}>
                                            <Typography variant="subtitle1" onMouseEnter={onMouseEnter} onMouseLeave={onMouseExit} color={buttonColor}>Past Trade</Typography>
                                        </Button>
                                    </Grid>
                                </Grid>}
                        </Box>
                    </Grid>
                    <Grid item sx={{ mt: 3 }}>
                        {
                            profitLoss &&
                            <Card sx={{ borderRadius: "10px" }}>
                                <CardHeader
                                    title={<Typography variant="h5">Latest Return</Typography>} />
                                <CardContent>
                                    <Grid container direction="row">
                                        <Grid item sm={3} xs={6}>
                                            <b><MetricLabel label="latest return" /></b><br />
                                            <div> {PriceFormatter(profitLoss.profit)} ({ProfitFormatter(profitLoss.profit_rate)})</div>
                                        </Grid >
                                        <Grid item sm={3} xs={6}>
                                            <b><MetricLabel label="initial value" /></b><br />
                                            <div> {PriceFormatter(pastTrade.cost)} </div>
                                        </Grid >
                                        <Grid item sm={3} xs={6}>
                                            <b><MetricLabel label="latest value" /></b><br />
                                            <div> {PriceFormatter(latestTrade.cost)} </div>
                                        </Grid >
                                        <Grid item sm={3} xs={6}>
                                            <b><MetricLabel label="latest stock return" /></b><br />
                                            <div> {ProfitFormatter(profitLoss.stock_profit_rate)}</div><br />
                                        </Grid >
                                    </Grid>
                                    <Typography variant="body1">*All data are based on estimated options value on expiration date.</Typography>
                                </CardContent>
                            </Card>
                        }
                    </Grid>
                    <Grid item>
                        {
                            basicInfo &&
                            <>
                                <Card sx={{ mb: 4, mt: 3, borderRadius: "10px" }} >
                                    <CardHeader title={<Typography variant="h5">{trade.stock.ticker.symbol}</Typography>} />
                                    <CardContent>
                                        <TickerSummary basicInfo={basicInfo} />
                                    </CardContent>
                                </Card>
                            </>
                        }
                    </Grid>
                    <Grid item>
                        {trade.target_price_lower &&
                            <Card sx={{ mb: 4, mt: 3, borderRadius: "10px" }}>
                                <CardHeader title={<Typography variant="h5">Market Assumption</Typography>} />
                                <CardContent>
                                    <Grid container direction="row">
                                        <Grid item sm={6} xs={6}>
                                            <b><MetricLabel label="price target range" /></b><br />
                                            {PriceFormatter(trade.target_price_lower)} ({ProfitFormatter(trade.to_target_price_lower_ratio)})
                                            - {PriceFormatter(trade.target_price_upper)} ({ProfitFormatter(trade.to_target_price_upper_ratio)})
                                        </Grid>
                                        <Grid item sm={6} xs={6}>
                                            <b><MetricLabel label="potential return" /></b><br />
                                            {ProfitFormatter(trade.target_price_profit_ratio)} ({PriceFormatter(trade.target_price_profit)})
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        }
                    </Grid>
                    <Grid item>
                        <TradeDetailsCard pastTrade={pastTrade} trade={trade} latestTrade={latestTrade} hideShareButton={true} hideTitle={true} broker={broker} />
                    </Grid >
                </Grid>
            ) : 'Loading...'
            }
        </Grid >
    );
}