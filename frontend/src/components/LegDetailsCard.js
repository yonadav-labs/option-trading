import React from 'react';
import Card from 'react-bootstrap/Card';
import ContractDetailsCard from '../components/ContractDetailsCard';

import { PriceFormatter } from '../utils';

export default function LegDetailsCard(props) {
    const { leg, position_num } = props;

    if (leg.contract) {
        return (
            <Card>
                <Card.Header>
                    {position_num ? `Position #${position_num}: ` : null} {leg.display_name}
                </Card.Header>
                <ContractDetailsCard contract={leg.contract} hideTitle={true} />
            </Card>
        );
    } else if (leg.stock) {
        return (
            <Card>
                <Card.Header>
                    {position_num ? `Position #${position_num}: ` : null} {leg.display_name}
                </Card.Header>
            </Card>
        );
    } else if (leg.cash) {
        return (
            <Card>
                <Card.Header>
                    {position_num ? `Position #${position_num}: ` : null} {leg.display_name}
                </Card.Header>
            </Card>
        );
    }
    return null;
}