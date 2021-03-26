import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';

import {
    PriceFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter
} from '../../utils';
import MetricLabel from '../MetricLabel.js';

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
                                    <MetricLabel label="mid/mark" />
                                    {PriceFormatter(contract.mark)}
                                </Col>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="bid" />
                                    {PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}
                                </Col>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="ask" />
                                    {PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}
                                </Col>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="last" />
                                    {PriceFormatter(contract.last_price)}
                                </Col>
                            </Row>
                            <Row>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="day's change" />
                                    {PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)
                                </Col>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="day range" />
                                    {PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}
                                </Col>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="open interest" />
                                    {contract.open_interest}
                                </Col>
                                <Col sm="3" xs="6">
                                    <MetricLabel label="volume" />
                                    {contract.volume}
                                </Col>
                            </Row>
                            {readMore ? <>
                                <Row>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="delta" />
                                        {NumberRoundFormatter(contract.delta)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="theta" />
                                        {NumberRoundFormatter(contract.theta)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="gamma" />
                                        {NumberRoundFormatter(contract.gamma)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="vega" />
                                        {NumberRoundFormatter(contract.vega)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="rho" />
                                        {NumberRoundFormatter(contract.rho)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="implied volatility" />
                                        {PercentageFormatter(contract.implied_volatility)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="break-even at" />
                                        {PriceFormatter(contract.break_even_price)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="to expiration" />
                                        {contract.days_till_expiration} days
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="3" xs="12">
                                        <MetricLabel label="last traded" />
                                        {TimestampTimeFormatter(contract.last_trade_date)}
                                    </Col>
                                    <Col sm="3" xs="12">
                                        <MetricLabel label="quoted at" />
                                        {TimestampTimeFormatter(contract.quote_time)}
                                    </Col>
                                    <Col sm="3" xs="6">
                                        <MetricLabel label="notional value" />
                                        {PriceFormatter(contract.notional_value)}
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

