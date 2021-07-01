import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';

import {
    PriceFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter
} from '../../utils';
import MetricLabel from '../MetricLabel.js';

export default function ContractDetailsCard(props) {
    const { contract, hideTitle, expandReadMore } = props;
    const [readMore, setReadMore] = useState(expandReadMore);
    const linkName = readMore ? 'Collapse <<' : 'More >>'
    return (
        (
            contract ?
                <Card>
                    {hideTitle ? null : <Card.Header>{contract.display_name}</Card.Header>}
                    <Card.Body>
                        <Card.Text>
                            <Row>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="last" /><br />
                                    {PriceFormatter(contract.last_price)}
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="mid/mark" /><br />
                                    {PriceFormatter(contract.mark)}
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="bid x size" /><br />
                                    {PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="ask x size" /><br />
                                    {PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="volume" /><br />
                                    {contract.volume}
                                </Col>
                                <Col sm="2" xs="6">
                                    <MetricLabel label="open interest" /><br />
                                    {contract.open_interest}
                                </Col>
                            </Row>
                            {readMore ? <>
                                <Row>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="day's change" /><br />
                                        {PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="day range" /><br />
                                        {PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}
                                    </Col>

                                    <Col sm="2" xs="12">
                                        <MetricLabel label="last traded" /><br />
                                        {TimestampTimeFormatter(contract.last_trade_date)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="implied volatility" /><br />
                                        {PercentageFormatter(contract.implied_volatility)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="delta" /><br />
                                        {NumberRoundFormatter(contract.delta)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="gamma" /><br />
                                        {NumberRoundFormatter(contract.gamma)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="theta" /><br />
                                        {NumberRoundFormatter(contract.theta)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="vega" /><br />
                                        {NumberRoundFormatter(contract.vega)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="rho" /><br />
                                        {NumberRoundFormatter(contract.rho)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="itm probability" /><br />
                                        {PercentageFormatter(contract.itm_probability)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="to expiration" /><br />
                                        {contract.days_till_expiration} days
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="notional value" /><br />
                                        {PriceFormatter(contract.notional_value)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="break-even at" /><br />
                                        {PriceFormatter(contract.break_even_price)}
                                    </Col>
                                    <Col sm="2" xs="6">
                                        <MetricLabel label="quoted at" /><br />
                                        {TimestampTimeFormatter(contract.quote_time)}
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

