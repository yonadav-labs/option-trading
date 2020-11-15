import React from 'react';
import NumberFormat from 'react-number-format';
import { BsArrowsExpand, BsArrowsCollapse } from 'react-icons/bs';

// Returns the backend API base url.
export default function getApiUrl() {
    const { REACT_APP_API_URL } = process.env;
    if (REACT_APP_API_URL) {
        return REACT_APP_API_URL;
    }
    return `${window.location.origin}/api`
};

export function NumberRoundFormatter(num) {
    return (<NumberFormat value={num} displayType={'text'} decimalScale={2} />);
};

export function PriceFormatter(num) {
    return (<NumberFormat value={num} displayType={'text'} thousandSeparator={true} decimalScale={2} prefix={'$'} />);
};

export function PercentageFormatter(num) {
    if (num < 10) {
        return (<NumberFormat value={num * 100} displayType={'text'} decimalScale={2} suffix={'%'} />);
    } else {
        return (<NumberFormat value={num} displayType={'text'} decimalScale={0} suffix={'X'} />);
    }
};

export function PercentageWithAnnualizedFormatter(num, annualized_num) {
    return (<span> {PercentageFormatter(num)} &nbsp;({PercentageFormatter(annualized_num)} in APR)</span>)
};

export function TimestampFormatter(ts) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' })
    return (<span>{exp_date}</span>);
};

export function TimestampWithDaysFormatter(ts, days_till_expiration) {
    return (<span>{TimestampFormatter(ts)} (in {days_till_expiration} days)</span>);
};

export function ExpandContractRow() {
    return {
        renderer: row => (
            <div>
                <div className="row">
                    <div className="col-sm"><b>Last price:</b> {PriceFormatter(row.last_price)}</div>
                    <div className="col-sm"><b>Bid:</b> {PriceFormatter(row.bid)}</div>
                    <div className="col-sm"><b>Ask:</b> {PriceFormatter(row.ask)}</div>
                    <div className="col-sm"><b>Last trade date:</b> {TimestampFormatter(row.last_trade_date)}</div>
                </div>
                <div className="row">
                    <div className="col-sm"><b>Change:</b> {NumberRoundFormatter(row.change)}</div>
                    <div className="col-sm"><b>% Change:</b> {NumberRoundFormatter(row.percent_change)}%</div>
                    <div className="col-sm"><b>Volume:</b> {NumberRoundFormatter(row.volume)}</div>
                    <div className="col-sm"><b>Open interest:</b> {NumberRoundFormatter(row.open_interest)}</div>
                </div>
                <div className="row">
                    <div className="col-sm"><b>Implied volatility:</b> {PercentageFormatter(row.implied_volatility)}</div>
                    <div className="col-sm"><b>Contract size:</b> {row.contract_size}</div>
                    <div className="col-sm"><b>In the money:</b> {row.in_the_money ? 'Yes' : 'No'}</div>
                    <div className="col-sm"></div>
                </div>
            </div>
        ),
        showExpandColumn: true,
        expandHeaderColumnRenderer: ({ isAnyExpands }) => {
            return <span></span>;
        },
        expandColumnRenderer: ({ expanded }) => {
            if (expanded) {
                return (<BsArrowsCollapse />);
            }
            return (<BsArrowsExpand />);
        }
    }
}