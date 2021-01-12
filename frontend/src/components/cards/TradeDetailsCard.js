import React from 'react';
import Card from 'react-bootstrap/Card';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter } from '../../utils';
import LegDetailsCard from './LegDetailsCard.js';

export default function TradeDetailsCard(props) {
    const { trade, hideShareButton } = props;

    return (
        <Card>
            <Card.Header>{trade.display_name}</Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6"><Card.Title>Overview</Card.Title></div>
                    {hideShareButton ? null : <div className="col-md-6"><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </div>
                <Card.Text>
                    {trade.target_price ?
                        (<div className="row">
                            <div className="col-sm-4">Target price: {PriceFormatter(trade.target_price)} ({ProfitFormatter(trade.to_target_price_ratio)})</div>
                            <div className="col-sm-4">Profit at target: {PriceFormatter(trade.target_price_profit)}</div>
                            <div className="col-sm-4">ROI at target: {ProfitFormatter(trade.target_price_profit_ratio)}</div>
                        </div>) : null}

                    <div className="row">
                        <div className="col-sm-4">Break-even: {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})</div>
                        <div className="col-sm-4">Cost: {PriceFormatter(trade.cost)}</div>
                        <div className="col-sm-4"></div>
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