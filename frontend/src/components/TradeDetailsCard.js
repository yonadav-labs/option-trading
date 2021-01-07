import React from 'react';
import Card from 'react-bootstrap/Card';

import LegDetailsCard from '../components/LegDetailsCard';
import { getTradeTypeDisplay } from '../utils';

export default function TradeDetailsCard(props) {
    const { trade, hideTitle } = props;

    return (
        <div id="content" className="container min-vh-100" style={{ "marginTop": "4rem" }}>
            <Card>
                <Card.Body>
                    {hideTitle ? null : <Card.Title>{trade.stock.ticker.symbol} {getTradeTypeDisplay(trade.type)}</Card.Title>}
                    <Card.Text>
                        {
                            trade.legs.map((leg, index) => {
                                return (
                                    <div>
                                        <LegDetailsCard leg={leg} position_num={index + 1}></LegDetailsCard>
                                        {index < trade.legs.length - 1 ? <br /> : null}
                                    </div>
                                );
                            })
                        }
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
}