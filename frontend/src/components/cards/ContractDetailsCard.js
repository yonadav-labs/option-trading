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
                                    <Row><Col><Badge variant="secondary">Mid/mark</Badge></Col></Row>
                                    <Row><Col>{PriceFormatter(contract.mark)}</Col></Row>
                                </Col>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Bid</Badge></Col></Row>
                                <Row><Col>{PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}</Col></Row>
                                </Col>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Ask</Badge></Col></Row>
                                <Row><Col>{PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}</Col></Row>
                                </Col>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Last</Badge></Col></Row>
                                <Row><Col>{PriceFormatter(contract.last_price)}</Col></Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Change</Badge></Col></Row>
                                <Row><Col>{PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)</Col></Row>
                                </Col>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Range</Badge></Col></Row>
                                <Row><Col>{PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}</Col></Row>
                                </Col>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Open interest</Badge></Col></Row>
                                <Row><Col>{contract.open_interest}</Col></Row>
                                </Col>
                                <Col sm="3" xs="6">
                                <Row><Col><Badge variant="secondary">Volume</Badge></Col></Row>
                                <Row><Col>{contract.volume}</Col></Row>
                                </Col>
                            </Row>
                            {readMore ? <>
                                <Row>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Delta</Badge></Col></Row>
                                        <Row><Col>{NumberRoundFormatter(contract.delta)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Gamma</Badge></Col></Row>
                                        <Row><Col>{NumberRoundFormatter(contract.gamma)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Theta</Badge></Col></Row>
                                        <Row><Col>{NumberRoundFormatter(contract.theta)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Vega</Badge></Col></Row>
                                        <Row><Col>{NumberRoundFormatter(contract.vega)}</Col></Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Rho</Badge></Col></Row>
                                        <Row><Col>{NumberRoundFormatter(contract.rho)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Implied volatility</Badge></Col></Row>
                                        <Row><Col>{PercentageFormatter(contract.implied_volatility)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">Break-even at</Badge></Col></Row>
                                        <Row><Col>{PriceFormatter(contract.break_even_price)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <Row><Col><Badge variant="secondary">To expiration</Badge></Col></Row>
                                        <Row><Col>{contract.days_till_expiration} days</Col></Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="3" xs="12">
                                        <Row><Col><Badge variant="secondary">Last traded</Badge></Col></Row>
                                        <Row><Col>{TimestampTimeFormatter(contract.last_trade_date)}</Col></Row>
                                    </Col>
                                    <Col sm="3" xs="12">
                                        <Row><Col><Badge variant="secondary">Quoted at</Badge></Col></Row>
                                        <Row><Col>{TimestampTimeFormatter(contract.quote_time)}</Col></Row>
                                    </Col>
                                </Row>
                                <a className="read-more-link" style={{ cursor: 'pointer' }} onClick={() => { setReadMore(!readMore) }}>{linkName}</a>
                            </> : <a className="read-more-link" style={{ cursor: 'pointer' }} onClick={() => { setReadMore(!readMore) }}>{linkName}</a>}
                        </Card.Text>
                    </Card.Body>
                </Card>
                :
                null
        )
    );
}

