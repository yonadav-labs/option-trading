import React from 'react';
import Card from 'react-bootstrap/Card';

import LegDetailsCard from '../components/LegDetailsCard';
import { getTradeTypeDisplay, PriceFormatter, ProfitFormatter, TimestampDateFormatter } from '../utils';

export default function TradeDetailsCard(props) {
    const { trade, hideTitle } = props;

    return (

        <Card>
            <Card.Body>
                {hideTitle ? null : <Card.Title>{trade.stock.ticker.symbol} {TimestampDateFormatter(trade.min_expiration)} {getTradeTypeDisplay(trade.type)}</Card.Title>}
                <Card.Text>
                    <div className="row">
                        <div className="col-sm-3"><b>Target price: {PriceFormatter(trade.target_price)} ({ProfitFormatter(trade.to_target_price_ratio)})</b></div>
                        <div className="col-sm-3"><b>Profit at target: {PriceFormatter(trade.target_price_profit)}</b></div>
                        <div className="col-sm-3"><b>ROI at target: {ProfitFormatter(trade.target_price_profit_ratio)}</b></div>
                        <div className="col-sm-3"></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-3"><b>Breakeven: {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})</b></div>
                        <div className="col-sm-3"><b>Cost: {PriceFormatter(trade.cost)}</b></div>
                        <div className="col-sm-3"></div>
                        <div className="col-sm-3"></div>
                    </div>
                    <br></br>
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
    );
}