import React, { useState } from 'react';
import { Row, Col, Badge, Card } from 'react-bootstrap';

import {
    PriceFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter
} from '../../utils';

export default function ContractDetailsCard(props) {
    const { contract, hideTitle } = props;
    const [readMore, setReadMore] = useState(false);
    const linkName = readMore ? 'Collapse <<' : 'More >>'
    return (
        (
            contract ?
                <Card>
                    {hideTitle ? null : <Card.Header>{contract.display_name}</Card.Header>}
                    <Card.Body>
                        <Card.Text>
                            <Row>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Premium</Badge>
                                    <div>{PriceFormatter(contract.premium)}</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Bid</Badge>
                                    <div>{PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Ask</Badge>
                                    <div>{PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Last</Badge>
                                    <div>{PriceFormatter(contract.last_price)}</div>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Change</Badge>
                                    <div>{PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Range</Badge>
                                    <div>{PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Open interest</Badge>
                                    <div>{contract.open_interest}</div>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Badge variant="secondary">Volume</Badge>
                                    <div>{contract.volume}</div>
                                </Col>
                            </Row>
                            {readMore ? <div>
                                <Row>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Delta</Badge>
                                        <div>{NumberRoundFormatter(contract.delta)}</div>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Gamma</Badge>
                                        <div>{NumberRoundFormatter(contract.gamma)}</div>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Theta</Badge>
                                        <div>{NumberRoundFormatter(contract.theta)}</div>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Vega</Badge>
                                        <div>{NumberRoundFormatter(contract.vega)}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Rho</Badge>
                                        <div>{NumberRoundFormatter(contract.rho)}</div>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Implied volatility</Badge>
                                        <div>{PercentageFormatter(contract.implied_volatility)}</div>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">Break-even at</Badge>
                                        <div>{PriceFormatter(contract.break_even_price)}</div>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Badge variant="secondary">To expiration</Badge>
                                        <div>{contract.days_till_expiration} days</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="3" xs="12">
                                        <Badge variant="secondary">Last traded</Badge>
                                        <div>{TimestampTimeFormatter(contract.last_trade_date)}</div>
                                    </Col>
                                    <Col sm="3" xs="12">
                                        <Badge variant="secondary">Quoted at</Badge>
                                        <div>{TimestampTimeFormatter(contract.quote_time)}</div>
                                    </Col>
                                </Row>
                                <a className="read-more-link" style={{ cursor: 'pointer' }} onClick={() => { setReadMore(!readMore) }}>{linkName}</a>
                            </div> : <a className="read-more-link" style={{ cursor: 'pointer' }} onClick={() => { setReadMore(!readMore) }}>{linkName}</a>}
                        </Card.Text>
                    </Card.Body>
                </Card>
                :
                null
        )
    );
}

