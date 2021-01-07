import React from 'react';
import Card from 'react-bootstrap/Card';
import ContractDetailsCard from '../components/ContractDetailsCard';

import { PriceFormatter, getContractName } from '../utils';

export default function LegDetailsCard(props) {
    const { leg, position_num } = props;

    if (leg.contract) {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        {position_num ? `Position #${position_num}:` : null}
                        &nbsp;{leg.is_long ? 'Long' : 'Short'} {leg.units} {getContractName(leg.contract)} {leg.units > 1 ? 'options' : 'option'}
                        &nbsp;at {PriceFormatter(leg.contract.premium)}.
                    </Card.Title>
                    <Card.Text>
                        <ContractDetailsCard contract={leg.contract} hideTitle={true} />
                    </Card.Text>
                </Card.Body>
            </Card>
        );
    } else if (leg.stock) {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        {position_num ? `Position #${position_num}:` : null}&nbsp;
                        {leg.is_long ? 'Long' : 'Short'} {leg.units} shares of {leg.stock.ticker.symbol} stock.
                    </Card.Title>
                </Card.Body>
            </Card>
        );
    } else if (leg.cash) {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        {position_num ? `Position #${position_num}:` : null}
                        &nbsp;{leg.is_long ? 'Keep' : 'Borrow'} {PriceFormatter(leg.units)} cash balance as collateral.
                    </Card.Title>
                </Card.Body>
            </Card>
        );
    }
    return null;
}