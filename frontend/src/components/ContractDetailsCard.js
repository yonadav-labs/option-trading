import React from 'react';
import Card from 'react-bootstrap/Card';

import {
    PriceFormatter, TimestampDateFormatter, PercentageFormatter, TimestampTimeFormatter,
    NumberRoundFormatter, getContractName
} from '../utils';

export default function ContractDetailsCard(props) {
    const { contract, hideTitle } = props;

    return (
        (
            <Card>
                {
                    hideTitle ?
                        null :
                        <Card.Header>{getContractName(contract)}</Card.Header>
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