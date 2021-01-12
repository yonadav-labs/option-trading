import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

import {
    PriceFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter, TimestampDateFormatter, PriceMovementFormatter
} from '../../utils';

export default function ContractDetailsCard(props) {
    const { contract, hideTitle } = props;
    
    return (
        (
            <Card>
                {
                    hideTitle ?
                        null : <Card.Header>{contract.display_name}</Card.Header>
                        // null :
                        // <Card.Header>
                        //     <Row>
                        //         <Col>{contract.is_call ? 'Call' : 'Put'}</Col>
                        //         <Col>Expiration: {TimestampDateFormatter(contract.expiration)}</Col>
                        //         <Col>Strike: {PriceFormatter(contract.strike)}</Col>
                        //         {/* <Col>Bid: {PriceFormatter(contract.bid)}</Col> */}
                        //         <Col>Premium: {PriceFormatter(contract.premium)} <br/><small>Bid: {PriceFormatter(contract.bid)} Ask: {PriceFormatter(contract.ask)}</small></Col>
                        //         {/* <Col>Ask: {PriceFormatter(contract.ask)}</Col> */}
                        //         <Col>Breakeven: {PriceMovementFormatter(contract.to_break_even_ratio, contract.break_even_price)}</Col>
                        //     </Row>
                        // </Card.Header>
                }
                <Card.Body>
                    <Card.Text>
                        <div>
                            <div className="row">
                                <div className="col-sm-3">Last: {PriceFormatter(contract.last_price)}</div>
                                <div className="col-sm-3">Change: {PriceFormatter(contract.change)} ({NumberRoundFormatter(contract.percent_change)}%)</div>
                                <div className="col-sm-3">Bid: {PriceFormatter(contract.bid)} X {NumberRoundFormatter(contract.bid_size)}</div>
                                <div className="col-sm-3">Ask: {PriceFormatter(contract.ask)} X {NumberRoundFormatter(contract.ask_size)}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">Range: {PriceFormatter(contract.low_price)} - {PriceFormatter(contract.high_price)}</div>
                                <div className="col-sm-6">Last traded: {TimestampTimeFormatter(contract.last_trade_date)}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">Implied volatility: {PercentageFormatter(contract.implied_volatility)}</div>
                                <div className="col-sm-3">Theoretical value: {PriceFormatter(contract.theoretical_option_value)}</div>
                                <div className="col-sm-3">Time value: {PriceFormatter(contract.time_value)}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">Delta: {NumberRoundFormatter(contract.delta)}</div>
                                <div className="col-sm-3">Gamma: {NumberRoundFormatter(contract.gamma)}</div>
                                <div className="col-sm-3">Theta: {NumberRoundFormatter(contract.theta)}</div>
                                <div className="col-sm-3">Vega: {NumberRoundFormatter(contract.vega)}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">Quoted at: {TimestampTimeFormatter(contract.quote_time)}</div>
                            </div>
                        </div>
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    );
}