import React from 'react';
import Card from 'react-bootstrap/Card';
import ShareTradeBtn from '../ShareTradeBtn.js';
import { PriceFormatter, ProfitFormatter, PercentageFormatter } from '../../utils';
import LegDetailsCard from './LegDetailsCard.js';

export default function TradeDetailsCard(props) {
    const { trade, hideShareButton, hideDisclaimer, hideTitle } = props;

    return (
        <Card>
            {hideTitle ? null : <Card.Header>{trade.display_name}</Card.Header>}
            <Card.Body>
                <div className="row">
                    <div className="col-md-6"><Card.Title>Overview</Card.Title></div>
                    {hideShareButton ? null : <div className="col-md-6"><span style={{ float: 'right' }}><ShareTradeBtn trade={trade} /></span></div>}
                </div>
                <Card.Text>
                    {trade.target_price_lower ?
                        (<div className="row">
                            <div className="col-sm-6">Target price range
                            : {PriceFormatter(trade.target_price_lower)}({ProfitFormatter(trade.to_target_price_lower_ratio)})
                            - {PriceFormatter(trade.target_price_upper)}({ProfitFormatter(trade.to_target_price_upper_ratio)})
                            </div>
                            <div className="col-sm-6">Hypothetical return: {PriceFormatter(trade.target_price_profit)} ({ProfitFormatter(trade.target_price_profit_ratio)})</div>
                        </div>) : null}

                    <div className="row">
                        <div className="col-sm-6">Break-even at: {PriceFormatter(trade.break_even_price)} ({ProfitFormatter(trade.to_break_even_ratio)})</div>
                        <div className="col-sm-6">Profit limit:
                            {trade.profit_cap != null ?
                                (
                                    <span>
                                        {PriceFormatter(trade.profit_cap)} ({trade.profit_cap_ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(trade.profit_cap_ratio))})
                                    </span >
                                )
                                : (<span>unlimited</span>)}
                        </div>

                    </div>
                    <div className="row">
                        <div className="col-sm-6">Cost: {PriceFormatter(trade.cost)}</div>
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
                {hideDisclaimer ?
                    null :
                    (<p>
                        *Option contract data on this page is frozen at "Quoted at" time.<br />
                        *All data are based on estimated options value on expiration date.<br />
                        *Hypothetical return: average of possible return outcomes if share price hits within the target price range.
                    </p>)}
            </Card.Body>
        </Card >
    );
}