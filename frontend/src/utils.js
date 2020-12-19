import React from 'react';
import NumberFormat from 'react-number-format';
import { BsArrowsExpand, BsArrowsCollapse } from 'react-icons/bs';
import { Comparator } from 'react-bootstrap-table2-filter';

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

export function PercentageFormatter(num, percentage_decimal = 2) {
    if (num < 10) {
        return (<NumberFormat value={num * 100} displayType={'text'} decimalScale={percentage_decimal} suffix={'%'} />);
    } else {
        const billion = 1000000000;
        const trillion = billion * 1000;
        if (num > trillion) {
            return (<NumberFormat value={num / trillion} displayType={'text'} decimalScale={0} suffix={' trillion X'} />);
        } else if (num > billion) {
            return (<NumberFormat value={num / billion} displayType={'text'} decimalScale={0} suffix={' billion X'} />);
        } else {
            return (<NumberFormat value={num} displayType={'text'} decimalScale={0} suffix={'X'} />);
        }
    }
};

export function PriceWithPercentageFormatter(price_num, percentage_num) {
    return (<span>{PriceFormatter(price_num)}<small>({PercentageFormatter(percentage_num)})</small></span>);
};

export function ProfitFormatter(gain) {
    return (
        <span>
            {gain > 0 ? '+' : '-'}{PercentageFormatter(Math.abs(gain))}
        </span>
    );
};

export function PriceMovementFormatter(ratio, price) {
    return (
        <span>
            {PriceFormatter(price)}<small>({ratio > 0 ? '+' : '-'}{PercentageFormatter(Math.abs(ratio))})</small>
        </span >
    );
};

export function TimestampDateFormatter(ts) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'EST' })
    return (<span>{exp_date}</span>);
};

export function TimestampTimeFormatter(ts) {
    if (ts == 0) return (<span>N/A</span>);
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'EST' })
    const exp_time = new Date(ts * 1000).toLocaleTimeString('en-US', { 'timeZone': 'EST', hour: '2-digit', minute: '2-digit' })
    return (<span>{exp_date} {exp_time} EST</span>);
};

export function ExpDayFormatter(ts, days_till_expiration) {
    return (
        <span>
            <small>Expire on {TimestampDateFormatter(ts)} ({days_till_expiration} days)</small>
        </span>
    );
};

export function ExpandContractRow() {
    return {
        renderer: row => (
            <div>
                <div className="row">
                    <div className="col-sm-3"><b>Last price:</b> {PriceFormatter(row.contract.last_price)}</div>
                    <div className="col-sm-3"><b>Bid:</b> {PriceFormatter(row.contract.bid)}</div>
                    <div className="col-sm-3"><b>Ask:</b> {PriceFormatter(row.contract.ask)}</div>
                    <div className="col-sm-3"><b>Change:</b> {NumberRoundFormatter(row.contract.change)}</div>
                </div>
                <div className="row">
                    <div className="col-sm-3"><b>% Change:</b> {NumberRoundFormatter(row.contract.percent_change)}%</div>
                    <div className="col-sm-3"><b>Volume:</b> {NumberRoundFormatter(row.contract.volume)}</div>
                    <div className="col-sm-3"><b>Open interest:</b> {NumberRoundFormatter(row.contract.open_interest)}</div>
                    <div className="col-sm-3"><b>Implied volatility:</b> {PercentageFormatter(row.contract.implied_volatility)}</div>
                </div>
                <div className="row">
                    <div className="col-sm-3"><b>Contract size:</b> {row.contract.contract_size}</div>
                    <div className="col-sm-3"><b>In the money:</b> {row.contract.in_the_money ? 'Yes' : 'No'}</div>
                    <div className="col-sm-6"><b>Last traded:</b> {TimestampTimeFormatter(row.contract.last_trade_date)}</div>
                </div>
                <div className="row">

                </div>
            </div>
        ),
        showExpandColumn: true,
        expandHeaderColumnRenderer: ({ isAnyExpands }) => {
            if (isAnyExpands) {
                return (<BsArrowsCollapse style={{ "cursor": "pointer" }} />);
            }
            return (<BsArrowsExpand style={{ "cursor": "pointer" }} />);
        },
        expandColumnRenderer: ({ expanded }) => {
            if (expanded) {
                return (<BsArrowsCollapse style={{ "cursor": "pointer" }} />);
            }
            return (<BsArrowsExpand style={{ "cursor": "pointer" }} />);
        }
    }
}

export function InTheMoneyRowStyle(row, rowIndex) {
    const style = {};
    if (row.contract.in_the_money) {
        style.backgroundColor = '#e0f0ff';
    }
    return style;
};

export function InTheMoneySign() {
    return (
        <div display="block" style={{
            backgroundColor: '#e0f0ff', float: 'right', borderLeftWidth: '5px',
            borderLeftStyle: 'solid', borderLeftColor: '#007bff', padding: '5px',
            marginBottom: '5px'
        }}><span>In The Money</span></div>)
}

export function onInTheMoneyFilterChange(event, inTheMoneyFilter) {
    const { value } = event.target;
    if (value == 'all') {
        inTheMoneyFilter([true, false]);
    } else if (value == 'itm') {
        inTheMoneyFilter([true]);
    } else if (value == 'otm') {
        inTheMoneyFilter([false]);
    }
};

export function onLastTradedFilterChange(event, lastTradedFilter) {
    const { value } = event.target;
    lastTradedFilter({
        number: Date.now() / 1000 - value * 3600,
        comparator: Comparator.GT
    });
};