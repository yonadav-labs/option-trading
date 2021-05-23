import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter, TimestampTimeFormatter, TimestampDateFormatter, GenerateTradeTitle } from '../../utils';
import LegDetailsCard from './LegDetailsCard.js';
import TradeProfitLossGraph from '../TradeProfitLossGraph.js';
import MetricLabel from '../MetricLabel.js';
import { startCase } from 'lodash';

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
            {hideTitle ?
                null
                :
                <Card.Header>
                    {GenerateTradeTitle(trade)}
                </Card.Header>
            }
            <Card.Body>
                <Row>
                    <Col><h5>Overview</h5></Col>
                    {hideShareButton ? null : <div className="col-md-6"><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </Row>
                <Card.Text>
                    <Row className="mb-3">
                        <Col sm="2" xs="6">
                            <MetricLabel label="ticker" /><br />
                            {trade.stock.ticker.symbol}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="strategy" /><br />
                            {startCase(trade.type)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label={trade.net_debit_per_unit > 0 ? "order net debit" : "order net credit"} /><br />
                            {PriceFormatter(Math.abs(trade.net_debit_per_unit))}
                        </Col>
                        <Col sm="2" xs="6"></Col>
                        <Col sm="2" xs="6"></Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="quoted at" /><br />
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
                    <Row className="mt-3">
                        <Col><h5>Key Data</h5></Col>
                    </Row>
                    <Row>
                        <Col sm="2" xs="6">
                            <MetricLabel label="break-even at" /><br />
                            {trade.break_even_prices_and_ratios.map(break_even => <span>{ProfitFormatter(break_even.ratio)} (at {PriceFormatter(break_even.price)})<br /></span>)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="max return" /><br />
                            {trade.best_return != null && trade.best_return != 'infinite' ?
                                (
                                    <span>
                                        {trade.reward_to_risk_ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(trade.reward_to_risk_ratio))} ({PriceFormatter(trade.best_return)})
                                    </span >
                                )
                                : (<span>Unlimited</span>)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="10% probability loss" /><br />
                            {
                                trade.two_sigma_profit_lower ?
                                    <>
                                        {ProfitFormatter(trade.ten_percent_worst_return_ratio)}
                                                ({PriceFormatter(trade.ten_percent_worst_return)})
                                                <br />
                                        {trade.ten_percent_worst_return_price > trade.stock.stock_price ? 'Above ' : 'Below '}
                                        {PriceFormatter(trade.ten_percent_worst_return_price)}
                                    </>
                                    : "N/A"
                            }
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="10% probability profit" /><br />
                            {
                                trade.two_sigma_profit_lower ?
                                    <>
                                        {ProfitFormatter(trade.ten_percent_best_return_ratio)}
                                                ({PriceFormatter(trade.ten_percent_best_return)})
                                                <br />
                                        {trade.ten_percent_best_return_price > trade.stock.stock_price ? 'Above ' : 'Below '}
                                        {PriceFormatter(trade.ten_percent_best_return_price)}
                                    </>
                                    : "N/A"
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="2" xs="6">
                            <MetricLabel label="total cost" /><br />
                            {PriceFormatter(trade.cost)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="notional value" /><br />
                            {PriceFormatter(trade.notional_value)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="leverage" /><br />
                            {PercentageFormatter(trade.leverage)}
                        </Col>

                        {displayCommissionCost &&
                            <Col sm="2" xs="6">
                                <MetricLabel label="total commission" /><br />
                                {PriceFormatter(trade.commission_cost)}
                            </Col>
                        }
                    </Row>
                    <TradeProfitLossGraph trade={trade} />
                    {trade.target_price_lower &&
                        <>
                            <Row>
                                <Col><h5>Market Assumption</h5></Col>
                            </Row>
                            <Row>
                                <Col sm="4" xs="6">
                                    <MetricLabel label="price target range" /><br />
                                    {PriceFormatter(trade.target_price_lower)} ({ProfitFormatter(trade.to_target_price_lower_ratio)})
                                    - {PriceFormatter(trade.target_price_upper)} ({ProfitFormatter(trade.to_target_price_upper_ratio)})
                                    </Col>
                                <Col sm="4" xs="6">
                                    <MetricLabel label="hypothetical return" /><br />
                                    {ProfitFormatter(trade.target_price_profit_ratio)} ({PriceFormatter(trade.target_price_profit)})
                                    </Col>
                            </Row>
                        </>
                    }
                    {
                        profitLoss &&
                        <>
                            <Row className="mt-3">
                                <Col><h5>Latest Return</h5></Col>
                            </Row>
                            <Row>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="latest return" /><br />
                                    <div> {PriceFormatter(profitLoss.profit)} ({ProfitFormatter(profitLoss.profit_rate)})</div>
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="initial value" /><br />
                                    <div> {PriceFormatter(trade.cost)} </div>
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="latest value" /><br />
                                    <div> {PriceFormatter(latestTrade.cost)} </div>
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="latest stock return" /><br />
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