import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter, getTradeTypeDisplay, TimestampTimeFormatter } from '../../utils';
import LegDetailsCard from './LegDetailsCard.js';
import TradeProfitLossGraph from '../TradeProfitLossGraph.js';
import MetricLabel from '../MetricLabel.js';

export default function TradeDetailsCard(props) {
    const { trade, latestTrade, hideShareButton, hideDisclaimer, hideTitle, broker } = props;
    const displayCommissionCost = broker && broker.options_open_commission + broker.options_close_commission > 0.0;

    let profitLoss;
    if (latestTrade) {
        let profit = latestTrade.cost - trade.cost;
        let profit_rate = profit / trade.cost;
        let stock_profit_rate = latestTrade.stock.stock_price / trade.stock.stock_price - 1;
        profitLoss = { profit, profit_rate, stock_profit_rate };
    }

    return (
        <Card>
            {hideTitle ? null : <Card.Header>{trade.display_name}</Card.Header>}
            <Card.Body>
                <Row>
                    <Col><h5>Overview</h5></Col>
                    {hideShareButton ? null : <div className="col-md-6"><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </Row>
                <Card.Text>
                    <Row className="mb-3">
                        <Col sm="2" xs="6">
                            <MetricLabel label="ticker" />
                            {trade.stock.ticker.symbol}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="strategy" />
                            {getTradeTypeDisplay(trade.type)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label={trade.net_debit_per_unit > 0 ? "net debit" : "net credit"} />
                            {PriceFormatter(Math.abs(trade.net_debit_per_unit))}
                        </Col>
                        <Col sm="2" xs="6"></Col>
                        <Col sm="2" xs="6"></Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="quoted at" />
                            {TimestampTimeFormatter(trade.quote_time)}
                        </Col>
                    </Row>
                    {
                        trade.legs.map((leg, index) => {
                            return (
                                <div key={"leg_" + index + "_details"}>
                                    <LegDetailsCard key={index} leg={leg} leg_num={index + 1}></LegDetailsCard>
                                    {index < trade.legs.length - 1 ? <br /> : null}
                                </div>
                            );
                        })
                    }
                    <TradeProfitLossGraph trade={trade} />
                    {trade.target_price_lower &&
                        <>
                            <Row>
                                <Col><h5>Market Assumption</h5></Col>
                            </Row>
                            <Row>
                                <Col sm="4" xs="6">
                                    <MetricLabel label="target price range" />
                                    {PriceFormatter(trade.target_price_lower)} ({ProfitFormatter(trade.to_target_price_lower_ratio)})
                                    - {PriceFormatter(trade.target_price_upper)} ({ProfitFormatter(trade.to_target_price_upper_ratio)})
                                    </Col>
                                <Col sm="4" xs="6">
                                    <MetricLabel label="hypothetical profit" />
                                    {PriceFormatter(trade.target_price_profit)} ({ProfitFormatter(trade.target_price_profit_ratio)})
                                    </Col>
                            </Row>
                        </>
                    }

                    <Row className="mt-3">
                        <Col><h5>Key Data</h5></Col>
                    </Row>
                    <Row>
                        <Col sm="2" xs="6">
                            <MetricLabel label="break-even at" />
                            {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="profit limit" />
                            {trade.profit_cap != null ?
                                (
                                    <span>
                                        {PriceFormatter(trade.profit_cap)} ({trade.profit_cap_ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(trade.profit_cap_ratio))})
                                    </span >
                                )
                                : (<span>Unlimited</span>)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="cost" />
                            {PriceFormatter(trade.cost)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="notional value" />
                            {PriceFormatter(trade.notional_value)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="leverage" />
                            {PercentageFormatter(trade.leverage)}
                        </Col>
                        {trade.two_sigma_profit_lower != null ?
                            (
                                <Col sm="2" xs="6">
                                    <MetricLabel label="5% chance wrost case loss" />
                                    <span>
                                        {PriceFormatter(trade.two_sigma_profit_lower)}&nbsp;
                                        {ProfitFormatter(Math.abs(trade.two_sigma_profit_lower_ratio))}&nbsp;
                                <small>if stock price at {PriceFormatter(trade.two_sigma_prices[0])}</small>
                                    </span >
                                </Col>
                            ) : null}
                        {displayCommissionCost &&
                            <Col sm="2" xs="6">
                                <MetricLabel label="commission cost" />
                                {PriceFormatter(broker.options_open_commission)}/{PriceFormatter(broker.options_close_commission)}
                            </Col>
                        }
                    </Row>
                    {
                        profitLoss &&
                        <>
                            <Row className="mt-3">
                                <Col><h5>Latest Return</h5></Col>
                            </Row>
                            <Row>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="latest return" />
                                    <div> {PriceFormatter(profitLoss.profit)} ({ProfitFormatter(profitLoss.profit_rate)})</div>
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="initial value" />
                                    <div> {PriceFormatter(trade.cost)} </div>
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="latest value" />
                                    <div> {PriceFormatter(latestTrade.cost)} </div>
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="latest stock return" />
                                    <div> {ProfitFormatter(profitLoss.stock_profit_rate)}</div>
                                </Col>
                            </Row>
                        </>
                    }
                </Card.Text>
                {hideDisclaimer ?
                    null : (<span>*All data are based on estimated options value on expiration date.</span>)}
            </Card.Body>
        </Card >
    );
}