import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter } from '../../utils';
import LegDetailsCard from './LegDetailsCard.js';
import TradeProfitLossGraph from '../TradeProfitLossGraph.js';

export default function TradeDetailsCard(props) {
    const { trade, hideShareButton, hideDisclaimer, hideTitle } = props;
    // console.log(trade)

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
                                <Badge variant="secondary">Target Price Range</Badge>
                                <br />
                                {PriceFormatter(trade.target_price_lower)}({ProfitFormatter(trade.to_target_price_lower_ratio)})
                        - {PriceFormatter(trade.target_price_upper)}({ProfitFormatter(trade.to_target_price_upper_ratio)})
                            </Col>) : null}
                        {trade.target_price_lower ?
                            (<Col sm="3" xs="6">
                                <Badge variant="secondary">Hypothetical Profit</Badge>
                                <br />
                                {PriceFormatter(trade.target_price_profit)} ({ProfitFormatter(trade.target_price_profit_ratio)})
                            </Col>) : null}
                        <Col sm="3" xs="6">
                            <Badge variant="secondary">Break-Even At</Badge>
                            <br />
                            {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})
                        </Col>
                        <Col sm="3" xs="6">
                            <Badge variant="secondary">Profit Limit</Badge>
                            <br />
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
                            <Badge variant="secondary">Cost</Badge>
                            <br />
                            {PriceFormatter(trade.cost)}
                        </Col>
                        <Col sm="3" xs="6">
                            <Badge variant="secondary">Notional Value</Badge>
                            <br />
                            {PriceFormatter(trade.notional_value)}
                        </Col>
                        <Col sm="3" xs="6">
                            <Badge variant="secondary">Leverage</Badge>
                            <br />
                            {PercentageFormatter(trade.leverage)}
                        </Col>
                    </Row>
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
                        *All data are based on estimated options value on expiration date.<br />
                        *Hypothetical profit: average of possible profit outcomes if share price hits within the target price range.
                    </p>)}
            </Card.Body>
        </Card >
    );
}