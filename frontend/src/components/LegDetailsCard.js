import React from 'react';
import Card from 'react-bootstrap/Card';
import ContractDetailsCard from '../components/ContractDetailsCard';

import { PriceFormatter, getContractName } from '../utils';

export default function LegDetailsCard(props) {
    const { leg, position_num } = props;

    if (leg.contract) {
        return (
            <Card>
                <Card.Header>
                    {position_num ? `Position #${position_num}: ` : null}
                    {leg.is_long ? 'Long' : 'Short'} {leg.units} {getContractName(leg.contract)} {leg.units > 1 ? 'options' : 'option'} at&nbsp;
                    {PriceFormatter(leg.cost)} per contract.
                </Card.Header>
                <ContractDetailsCard contract={leg.contract} hideTitle={true} />
            </Card>
        );
    } else if (leg.stock) {
        return (
            <Card>
                <Card.Header>
                    {position_num ? `Position #${position_num}: ` : null}
                    {leg.is_long ? 'Long' : 'Short'} {leg.units} shares of {leg.stock.ticker.symbol} stock
                    at {PriceFormatter(leg.stock.stock_price)} per share.
                </Card.Header>
            </Card>
        );
    } else if (leg.cash) {
        return (
            <Card>
                <Card.Header>
                    {position_num ? `Position #${position_num}: ` : null}
                        &nbsp;{leg.is_long ? 'Keep' : 'Borrow'} {PriceFormatter(leg.units)} cash balance.
                </Card.Header>
            </Card>
        );
    }
    return null;
}