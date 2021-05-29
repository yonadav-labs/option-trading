import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import ContractDetailsCard from './ContractDetailsCard';
import MetricLabel from '../MetricLabel.js';
import { PriceFormatter, TimestampDateFormatter } from '../../utils';


export default function LegDetailsCard(props) {
    const { leg, leg_num } = props;

    if (leg.contract) {
        return (
            <Card>
                <Card.Header>
                    <Row>
                        <Col sm="2" xs="6">
                            <h5>{leg_num ? `LEG ${leg_num}` : null}</h5>
                            Qty: {leg.units}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="action" /><br />
                            {leg.is_long ? 'Long' : 'Short'}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="quantity" /><br />
                            {leg.units} {leg.units > 1 ? 'contracts' : 'contract'}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="expiration" /><br />
                            {TimestampDateFormatter(leg.contract.expiration)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="strike" hideIcon /><br />
                            {PriceFormatter(leg.contract.strike)}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="call/put" /><br />
                            {leg.contract.is_call ? 'Call' : 'Put'}
                        </Col>
                        {/* <Col sm="2" xs="6">
                            <MetricLabel label="order price" />
                            {PriceFormatter(leg.cost_per_share)} ({leg.premium_type === 'market' ? (leg.is_long ? 'Ask' : 'Bid') : 'Mid/Mark'})
                        </Col> */}
                    </Row>
                </Card.Header>
                <ContractDetailsCard contract={leg.contract} hideTitle={true} />
            </Card>
        );
    } else if (leg.stock) {
        return (
            <Card>
                <Card.Header>
                    <Row>
                        <Col sm="2" xs="6">
                            <h5>{leg_num ? `LEG ${leg_num}` : null}</h5>
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="action" />
                            {leg.is_long ? 'Long' : 'Short'}
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="quantity" />
                            {leg.units} shares
                        </Col>
                    </Row>
                </Card.Header>
            </Card>
        );
    } else if (leg.cash) {
        return (
            <Card>
                <Card.Header>
                    <Row>
                        <Col sm="2" xs="6">
                            <h5>{leg_num ? `LEG ${leg_num}` : null}</h5>
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="action" />
                            Keep as collateral
                        </Col>
                        <Col sm="2" xs="6">
                            <MetricLabel label="quantity" />
                            {PriceFormatter(leg.units)} cash
                        </Col>
                    </Row>
                </Card.Header>
            </Card>
        );
    }
    return null;
}