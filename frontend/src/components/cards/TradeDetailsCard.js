import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter } from '../../utils';
import LegDetailsCard from './LegDetailsCard.js';
import TradeProfitLossGraph from '../TradeProfitLossGraph.js';
import MetricLabel from '../MetricLabel.js';

export default function TradeDetailsCard(props) {
    const { trade, hideShareButton, hideDisclaimer, hideTitle, broker } = props;

    return (
        <Card>
            {hideTitle ? null : <Card.Header>{trade.display_name}</Card.Header>}
            <Card.Body>
                <Row>
                    <div className="col-md-6"><Card.Title>Overview</Card.Title></div>
                    {hideShareButton ? null : <div className="col-md-6"><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </Row>
                <Card.Text>
                    <Row>
                        {trade.target_price_lower ?
                            (<Col sm="3" xs="6">
                                <MetricLabel label="target price range" />
                                {PriceFormatter(trade.target_price_lower)} ({ProfitFormatter(trade.to_target_price_lower_ratio)})
                        - {PriceFormatter(trade.target_price_upper)} ({ProfitFormatter(trade.to_target_price_upper_ratio)})
                            </Col>) : null}
                        {trade.target_price_lower ?
                            (<Col sm="3" xs="6">
                                <MetricLabel label="hypothetical profit" />
                                {PriceFormatter(trade.target_price_profit)} ({ProfitFormatter(trade.target_price_profit_ratio)})
                            </Col>) : null}
                        <Col sm="3" xs="6">
                            <MetricLabel label="break-even at" />
                            {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})
                        </Col>
                        <Col sm="3" xs="6">
                            <MetricLabel label="profit limit" />
                            {trade.profit_cap != null ?
                                (
                                    <span>
                                        {PriceFormatter(trade.profit_cap)} ({trade.profit_cap_ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(trade.profit_cap_ratio))})
                                    </span >
                                )
                                : (<span>Unlimited</span>)}
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="3" xs="6">
                            <MetricLabel label="cost" />
                            {PriceFormatter(trade.cost)}
                        </Col>
                        <Col sm="3" xs="6">
                            <MetricLabel label="notional value" />
                            {PriceFormatter(trade.notional_value)}
                        </Col>
                        <Col sm="3" xs="6">
                            <MetricLabel label="leverage" />
                            {PercentageFormatter(trade.leverage)}
                        </Col>
                        {trade.two_sigma_profit_lower != null ?
                            (
                                <Col sm="3" xs="6">
                                    <MetricLabel label="5% chance wrost case loss" />
                                    <span>
                                        {PriceFormatter(trade.two_sigma_profit_lower)}&nbsp;
                                ({trade.two_sigma_profit_lower_ratio >= 0 ? '+' : '-'}
                                        {PercentageFormatter(Math.abs(trade.two_sigma_profit_lower_ratio))})&nbsp;
                                <small>if stock price at {PriceFormatter(trade.two_sigma_prices[0])}</small>
                                    </span >
                                </Col>
                            ) : null}
                    </Row>
                    {broker && broker.options_open_commission + broker.options_close_commission > 0.0 &&
                        < Row >
                            <Col sm="3" xs="6">
                                <MetricLabel label="open commission" />
                                {PriceFormatter(broker.options_open_commission)}
                            </Col>
                            <Col sm="3" xs="6">
                                <MetricLabel label="close commission" />
                                {PriceFormatter(broker.options_close_commission)}
                            </Col>
                        </Row>
                    }
                    <br />
                    <TradeProfitLossGraph trade={trade} />
                    <Card.Title>Details</Card.Title>
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
                </Card.Text>
                {hideDisclaimer ?
                    null :
                    (<p>
                        *Option contract data on this page is frozen at "Quoted at" time.<br />
                        *All data are based on estimated options value on expiration date.
                    </p>)}
            </Card.Body>
        </Card >
    );
}