import React from 'react';
import Card from 'react-bootstrap/Card';

import LegDetailsCard from '../components/LegDetailsCard';
import ShareTradeBtn from '../components/ShareTradeBtn.js';
import { getTradeTypeDisplay, PriceFormatter, ProfitFormatter, TimestampDateFormatter } from '../utils';

export default function TradeDetailsCard(props) {
    const { trade, hideTitle, hideShareButton } = props;

    return (
        <Card>
            {hideTitle ? null : <Card.Header>{trade.stock.ticker.symbol} {TimestampDateFormatter(trade.min_expiration)} {getTradeTypeDisplay(trade.type)} strategy</Card.Header>}
            <Card.Body>
                <div className="row">
                    <div className="col-md-6"><Card.Title>Overview</Card.Title></div>
                    {hideShareButton ? null : <div className="col-md-6"><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </div>
                <Card.Text>
                    <div className="row">
                        <div className="col-sm-3">Target price: {PriceFormatter(trade.target_price)} ({ProfitFormatter(trade.to_target_price_ratio)})</div>
                        <div className="col-sm-3">Profit at target: {PriceFormatter(trade.target_price_profit)}</div>
                        <div className="col-sm-3">ROI at target: {ProfitFormatter(trade.target_price_profit_ratio)}</div>
                        <div className="col-sm-3"></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-3">Breakeven: {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})</div>
                        <div className="col-sm-3">Cost: {PriceFormatter(trade.cost)}</div>
                        <div className="col-sm-3"></div>
                        <div className="col-sm-3"></div>
                    </div>
                    <br />
                    <Card.Title>Details</Card.Title>
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
        </Card >
    );
}