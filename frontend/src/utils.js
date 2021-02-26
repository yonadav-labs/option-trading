import React from 'react';
import NumberFormat from 'react-number-format';
import { Comparator } from 'react-bootstrap-table2-filter';
import { Col, Row } from 'react-bootstrap';
import Axios from 'axios';

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

export function getPaypalMonthlyPlanId() {
    const { REACT_APP_PAYPAL_MONTHLY_PLAN_ID } = process.env;
    return REACT_APP_PAYPAL_MONTHLY_PLAN_ID
};

export function getPaypalYearlyPlanId() {
    const { REACT_APP_PAYPAL_YEARLY_PLAN_ID } = process.env;
    return REACT_APP_PAYPAL_YEARLY_PLAN_ID
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
            <small>{ratio >= 0 ? '+' : '-'}{PercentageFormatter(Math.abs(ratio))}</small>
        </span >
    );
};

export function TimestampDateFormatter(ts) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US')
    return (<span>{exp_date}</span>);
};

export function TimestampTimeFormatter(ts) {
    if (ts == 0) return (<span>N/A</span>);
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US')
    const exp_time = new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return (<span>{exp_date} {exp_time}</span>);
};

export function ExpDayFormatter(ts, days_till_expiration) {
    return (
        <span>
            <small>Expire on {TimestampDateFormatter(ts)} ({days_till_expiration} days)</small>
        </span>
    );
};


export function InTheMoneyRowStyle(row, rowIndex) {
    const style = { "cursor": "pointer" };
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

export function getAllTradeTypes(type) {
    return ['long_call', 'covered_call', 'long_put', 'cash_secured_put', 'bull_call_spread', 'bear_call_spread',
        'bear_put_spread', 'bull_put_spread'];
}
export function getContractName(contract) {
    return (
        <Row>
            {/* <Col>{contract.ticker.symbol}</Col> */}
            <Col>{contract.is_call ? 'Call' : 'Put'}</Col>
            <Col>{TimestampDateFormatter(contract.expiration)}</Col>
            <Col>{PriceFormatter(contract.strike)}</Col>
        </Row>
    );
};

export function getTradeTypeDisplay(type) {
    let typeToName = {
        'long_call': 'Long call',
        'covered_call': 'Covered call',
        'long_put': 'Long put',
        'cash_secured_put': 'Cash secured put',
        'bull_call_spread': 'Bull call spread',
        'bear_call_spread': 'Bear call spread',
        'bear_put_spread': 'Bear put spread',
        'bull_put_spread': 'Bull put spread',
    }
    return typeToName[type];
}

export function getTradeStrikeStr(row) {
    switch (row.type) {
        case ("long_call"): {
            let longCallLeg = getLegByName(row, 'long_call_leg');
            return `Strike $${longCallLeg.contract.strike}`;
        }
        case ("covered_call"): {
            let shortCallLeg = getLegByName(row, 'short_call_leg');
            return `Strike $${shortCallLeg.contract.strike}`;
        }
        case ("long_put"): {
            let longPutLeg = getLegByName(row, 'long_put_leg');
            return `Strike $${longPutLeg.contract.strike}`;
        }
        case ("cash_secured_put"): {
            let shortPutLeg = getLegByName(row, 'short_put_leg');
            return `Strike $${shortPutLeg.contract.strike}`;
        }
        case ("bull_call_spread"): {
            let longCallLeg = getLegByName(row, 'long_call_leg');
            let shortCallLeg = getLegByName(row, 'short_call_leg');
            return `Strike $${longCallLeg.contract.strike} / $${shortCallLeg.contract.strike}`;
        }
        case ("bear_call_spread"): {
            let longCallLeg = getLegByName(row, 'long_call_leg');
            let shortCallLeg = getLegByName(row, 'short_call_leg');
            return `Strike $${shortCallLeg.contract.strike} / $${longCallLeg.contract.strike}`;
        }
        case ("bear_put_spread"): {
            let longPutLeg = getLegByName(row, 'long_put_leg');
            let shortPutLeg = getLegByName(row, 'short_put_leg');
            return `Strike $${shortPutLeg.contract.strike} / $${longPutLeg.contract.strike}`;
        }
        case ("bull_put_spread"): {
            let longPutLeg = getLegByName(row, 'long_put_leg');
            let shortPutLeg = getLegByName(row, 'short_put_leg');
            return `Strike $${longPutLeg.contract.strike} / $${shortPutLeg.contract.strike}`;
        }
    }
}

// fetch tickers
export async function loadTickers(headers, setSelectedTicker, setAllTickers, querySymbol, onTickerSelectionChange) {
    try {
        let recentTickers = localStorage.getItem('tigerstance-recent-tickers') || '';
        recentTickers = recentTickers.split(' ');

        const response = await Axios.get(`${getApiUrl()}/tickers/`, {headers: headers});
        let visitedTickers = [];
        let restTickers = [];

        response.data.map((ticker) => {
            if (ticker.full_name) {
                ticker.display_label = ticker.symbol + ' - ' + ticker.full_name;
            } else {
                ticker.display_label = ticker.symbol;
            }

            if (querySymbol && ticker.symbol === querySymbol) {
                setSelectedTicker([ticker], onTickerSelectionChange([ticker]));
            }

            if (recentTickers.indexOf(ticker.symbol) > -1) {
                visitedTickers.push(ticker);
            } else {
                restTickers.push(ticker);
            }

            return ticker;
        });

        visitedTickers.sort((a, b) => (recentTickers.indexOf(a.symbol) - recentTickers.indexOf(b.symbol)));
        setAllTickers(visitedTickers.concat(restTickers));
    } catch (error) {
        console.error(error);
    }
};

const saveRecent = (symbol) => {
    let recentTickers = localStorage.getItem('tigerstance-recent-tickers') || '';
    recentTickers = recentTickers.replace(symbol, '');
    recentTickers = recentTickers.trim().replace(/\s+/g, ' ');
    localStorage.setItem('tigerstance-recent-tickers', `${symbol} ${recentTickers}`);
};

// fetch expiration dates
export async function loadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setbasicInfo, setSelectedTicker) {
    try {
        setModalActive(true);
        saveRecent(selected[0].symbol);
        const response = await Axios.get(`${getApiUrl()}/tickers/${selected[0].symbol}/expire_dates/`, {headers: headers});
        setExpirationTimestamps(response.data.expiration_timestamps);
        setbasicInfo(response.data.quote)
        selected[0].external_cache_id = response.data.external_cache_id;
        setSelectedTicker(selected);
        setModalActive(false);
    } catch (error) {
        console.error(error);
        setModalActive(false);
    }
};
