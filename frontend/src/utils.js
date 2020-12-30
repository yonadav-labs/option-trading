import React from 'react';
import Card from 'react-bootstrap/Card';
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

export function getPaypalClientId() {
    const { REACT_APP_PAYPAL_CLIENT_ID } = process.env;
    return REACT_APP_PAYPAL_CLIENT_ID
};

export function getPaypalPlanId() {
    const { REACT_APP_PAYPAL_PLAN_ID } = process.env;
    return REACT_APP_PAYPAL_PLAN_ID
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

export function ProfitFormatter(profit) {
    return (
        <span>
            {profit > 0 ? '+' : '-'}{PercentageFormatter(Math.abs(profit))}
        </span>
    );
};

export function PriceMovementFormatter(ratio, price) {
    return (
        <span>
            {PriceFormatter(price)}<br />
            <small>{ratio > 0 ? '+' : '-'}{PercentageFormatter(Math.abs(ratio))}</small>
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

export function ContractDetails(row) {
    return (
        <div>
            <div className="row">
                <div className="col-sm-3">Last: {PriceFormatter(row.last_price)}</div>
                <div className="col-sm-3">Change: {PriceFormatter(row.change)} ({NumberRoundFormatter(row.percent_change)}%)</div>
                <div className="col-sm-3">Bid: {PriceFormatter(row.bid)} X {NumberRoundFormatter(row.bid_size)}</div>
                <div className="col-sm-3">Ask: {PriceFormatter(row.ask)} X {NumberRoundFormatter(row.ask_size)}</div>
            </div>
            <div className="row">
                <div className="col-sm-3">Range: {PriceFormatter(row.low_price)} - {PriceFormatter(row.high_price)}</div>
                <div className="col-sm-6">Last traded: {TimestampTimeFormatter(row.last_trade_date)}</div>
            </div>
            <div className="row">
                <div className="col-sm-3">Implied volatility: {PercentageFormatter(row.implied_volatility)}</div>
                <div className="col-sm-3">Theoretical value: {PriceFormatter(row.theoretical_option_value)}</div>
                <div className="col-sm-3">Time value: {PriceFormatter(row.time_value)}</div>
            </div>
            <div className="row">
                <div className="col-sm-3">Delta: {NumberRoundFormatter(row.delta)}</div>
                <div className="col-sm-3">Gamma: {NumberRoundFormatter(row.gamma)}</div>
                <div className="col-sm-3">Theta: {NumberRoundFormatter(row.theta)}</div>
                <div className="col-sm-3">Vega: {NumberRoundFormatter(row.vega)}</div>
            </div>
        </div>
    );
}

export function ExpandContractRow() {
    return {
        renderer: (row) => (
            <Card>
                <Card.Body>
                    <Card.Title>Details</Card.Title>
                    <Card.Text>
                        {ContractDetails(row)}
                    </Card.Text>
                </Card.Body>
            </Card>
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
    if (row.in_the_money) {
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

export function getLegByName(trade, name) {
    let return_leg = null;
    trade.legs.forEach(function (leg) {
        if (leg.name == name) {
            return_leg = leg;
        }
    });
    return return_leg;
};