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

export function PercentageFormatter(num) {
    if (num < 10) {
        return (<NumberFormat value={num * 100} displayType={'text'} decimalScale={2} suffix={'%'} />);
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
    return (<span>{PriceFormatter(price_num)}&nbsp;<small>({PercentageFormatter(percentage_num)})</small></span>);
};

export function PercentageWithAnnualizedFormatter(num, annualized_num) {
    if (annualized_num == null) {
        return (<span>{PercentageFormatter(num)}</span>)
    }
    return (<span>{PercentageFormatter(num)}&nbsp;<small>({PercentageFormatter(annualized_num)} APR)</small></span>)
};

export function TimestampDateFormatter(ts) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' })
    return (<span>{exp_date}</span>);
};

export function TimestampTimeFormatter(ts) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' })
    const exp_time = new Date(ts * 1000).toLocaleTimeString('en-US', { 'timeZone': 'GMT', hour: '2-digit', minute: '2-digit', hour12: false })
    return (<span>{exp_date} {exp_time}</span>);
};

export function TimestampWithDaysFormatter(ts, days_till_expiration) {
    return (<span>{TimestampDateFormatter(ts)} <small>({days_till_expiration} days)</small></span>);
};

export function SmallTextFormatter(text) {
    return (<small>{text}</small>);
};

export function ExpandContractRow() {
    return {
        renderer: row => (
            <div>
                <div className="row">
                    <div className="col-sm"><b>Last price:</b> {PriceFormatter(row.last_price)}</div>
                    <div className="col-sm"><b>Bid:</b> {PriceFormatter(row.bid)}</div>
                    <div className="col-sm"><b>Ask:</b> {PriceFormatter(row.ask)}</div>
                    <div className="col-sm"><b>Last traded:</b> {TimestampTimeFormatter(row.last_trade_date)}</div>
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
    if (row.unique_strike_count) {
        if (row.in_the_money) {
            style.backgroundColor = row.unique_strike_count % 2 > 0 ? '#e0f0ff' : '#d3e2f0';
        } else {
            if (row.unique_strike_count % 2 === 0) {
                style.backgroundColor = '#f0f0f0';
            }
        }
    } else {
        // Without strike grouping.
        if (row.in_the_money) {
            style.backgroundColor = '#e0f0ff';
        }
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