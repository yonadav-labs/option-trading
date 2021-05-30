import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter, TimestampTimeFormatter, GenerateTradeTitle } from '../../utils';
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
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="ticker" /></b><br />
                            {trade.stock.ticker.symbol}
                        </Col>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="strategy" /></b><br />
                            {startCase(trade.type)}
                        </Col>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label={trade.net_debit_per_unit > 0 ? "order net debit" : "order net credit"} /></b><br />
                            {PriceFormatter(Math.abs(trade.net_debit_per_unit))}
                        </Col>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="quoted at" /></b><br />
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
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="probability of profit" /></b><br />
                            {PercentageFormatter(trade.profit_prob)}
                        </Col>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="break-even at" /></b><br />
                            {trade.break_even_prices_and_ratios.map(break_even => <span>{ProfitFormatter(break_even.ratio)} (at {PriceFormatter(break_even.price)})<br /></span>)}
                        </Col>
                        <Col sm="3" xs="6">
                            <b> <MetricLabel label="max return" /></b><br />
                            {trade.best_return != null && trade.best_return != 'infinite' ?
                                (
                                    <span>
                                        {trade.reward_to_risk_ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(trade.reward_to_risk_ratio))} ({PriceFormatter(trade.best_return)})
                                    </span >
                                )
                                : (<span>Unlimited</span>)}
                        </Col>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="total cost" /></b><br />
                            {PriceFormatter(trade.cost)}
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="notional value" /></b><br />
                            {PriceFormatter(trade.notional_value)}
                        </Col>
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="leverage" /></b><br />
                            {PercentageFormatter(trade.leverage)}
                        </Col>

                        {displayCommissionCost &&
                            <Col sm="3" xs="6">
                                <b> <MetricLabel label="total commission" /></b><br />
                                {PriceFormatter(trade.commission_cost)}
                            </Col>
                        }

                        <Col sm="3" xs="6">
                            <b><MetricLabel label="10% probability loss" /></b><br />
                            {
                                trade.ten_percent_worst_return_ratio != null ?
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
                        <Col sm="3" xs="6">
                            <b><MetricLabel label="10% probability profit" /></b><br />
                            {
                                trade.ten_percent_best_return_ratio != null ?
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
                    <TradeProfitLossGraph trade={trade} />
                    {trade.target_price_lower &&
                        <>
                            <Row>
                                <Col><h5>Market Assumption</h5></Col>
                            </Row>
                            <Row>
                                <Col sm="3" xs="6">
                                    <b><MetricLabel label="price target range" /></b><br />
                                    {PriceFormatter(trade.target_price_lower)} ({ProfitFormatter(trade.to_target_price_lower_ratio)})
                                    - {PriceFormatter(trade.target_price_upper)} ({ProfitFormatter(trade.to_target_price_upper_ratio)})
                                    </Col>
                                <Col sm="3" xs="6">
                                    <b><MetricLabel label="hypothetical return" /></b><br />
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
                                <Col sm="3" xs="6">
                                    <b><MetricLabel label="latest return" /></b><br />
                                    <div> {PriceFormatter(profitLoss.profit)} ({ProfitFormatter(profitLoss.profit_rate)})</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <b><MetricLabel label="initial value" /></b><br />
                                    <div> {PriceFormatter(trade.cost)} </div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <b><MetricLabel label="latest value" /></b><br />
                                    <div> {PriceFormatter(latestTrade.cost)} </div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <b><MetricLabel label="latest stock return" /></b><br />
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