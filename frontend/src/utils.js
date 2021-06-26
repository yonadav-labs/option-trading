import React from 'react';
import NumberFormat from 'react-number-format';
import { Col, Row } from 'react-bootstrap';
import Axios from 'axios';
import ReactGA from 'react-ga';
import { startCase } from 'lodash';
import Moment from 'react-moment';

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

export function getPaypalPastMonthlyPlanIds() {
    const { REACT_APP_PAYPAL_PAST_MONTHLY_PLAN_IDS } = process.env;
    return REACT_APP_PAYPAL_PAST_MONTHLY_PLAN_IDS.split(',');
};

export function getPaypalPastYearlyPlanIds() {
    const { REACT_APP_PAYPAL_PAST_YEARLY_PLAN_IDS } = process.env;
    return REACT_APP_PAYPAL_PAST_YEARLY_PLAN_IDS.split(',');
};

export function NumberRoundFormatter(num) {
    return (<NumberFormat value={num} displayType={'text'} decimalScale={2} />);
};

export function PriceFormatter(num) {
    return (<NumberFormat value={num} displayType={'text'} thousandSeparator={true} decimalScale={2} prefix={'$'} />);
};

export function PercentageFormatter(num, percentage_decimal = 2) {
    if (num == null) {
        return "N/A";
    }
    if (num < 100) {
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

// https://stackoverflow.com/a/32638472/14903155
export function formatLargeNumber(num, fixed) {
    if (num === null) { return null; } // terminate early
    if (num === 0) { return '0'; } // terminate early
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    var b = (num).toPrecision(2).split("e"), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
        e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
}

export function TimestampDateFormatter(ts) {
    const exp_date = new Date(ts * 1000);
    return (<Moment date={exp_date} format="MMM Do, YY" />);
};

export function TimestampTimeFormatter(ts) {
    if (ts === 0) return (<span>N/A</span>);
    const exp_date = new Date(ts * 1000);
    return (<Moment date={exp_date} format="MMM Do, YY HH:mm" />);
};

export function ExpDateFormatter(ts) {
    const exp_date = new Date(ts * 1000);
    return (<Moment date={exp_date} format="MMM Do, YY (ddd)" />);
};

export function ExpDayFormatter(ts, days_till_expiration) {
    return (
        <span>
            <small>Expire on {TimestampDateFormatter(ts)} ({days_till_expiration} days)</small>
        </span>
    );
};

export function fixedFloat(x) {
    return parseFloat(x.toFixed(2));
}

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
    if (value === 'all') {
        inTheMoneyFilter([true, false]);
    } else if (value === 'itm') {
        inTheMoneyFilter([true]);
    } else if (value === 'otm') {
        inTheMoneyFilter([false]);
    }
};

export function getAllTradeTypes() {
    return ['long_call', 'covered_call', 'protective_put', 'long_put', 'cash_secured_put', 'bull_call_spread', 'bear_call_spread',
        'bear_put_spread', 'bull_put_spread', 'long_straddle', 'long_strangle', 'iron_condor', 'iron_butterfly',
        'short_strangle', 'short_straddle', 'long_butterfly_spread', 'short_butterfly_spread', 'long_condor_spread',
        'short_condor_spread', 'strap_straddle', 'strap_strangle'];
};

// Unlogged in users.
export function getDefaultDisAllowedTradeTypes() {
    return ['cash_secured_put', 'protective_put', 'bear_call_spread', 'bear_put_spread', 'bull_put_spread',
        'long_straddle', 'long_strangle', 'iron_condor', 'iron_butterfly', 'short_strangle', 'short_straddle',
        'long_butterfly_spread', 'short_butterfly_spread', 'long_condor_spread', 'short_condor_spread', 'strap_straddle',
        'strap_strangle'];
};

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

// fetch tickers
export async function loadTickers(headers, setSelectedTicker, setAllTickers, querySymbol, onTickerSelectionChange) {
    try {
        let recentTickers = localStorage.getItem('tigerstance-recent-tickers') || '';
        recentTickers = recentTickers.split(' ');

        const response = await Axios.get(`${getApiUrl()}/tickers/`, { headers });
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
        const response = await Axios.get(`${getApiUrl()}/tickers/${selected[0].symbol}/expire_dates/`, { headers: headers });
        setExpirationTimestamps(response.data.expiration_timestamps);
        setbasicInfo(response.data.quote)
        selected[0].external_cache_id = response.data.external_cache_id;
        selected[0].ticker_stats_id = response.data.ticker_stats.id;
        setSelectedTicker(selected);
        setModalActive(false);
    } catch (error) {
        console.error(error);
        setModalActive(false);
    }
};

// fetch expiration dates for new strategy screen and material ui
export async function newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setBasicInfo, setSelectedTicker) {
    try {
        setModalActive(true);
        saveRecent(selected.symbol);
        const response = await Axios.get(`${getApiUrl()}/tickers/${selected.symbol}/expire_dates/`, { headers: headers });
        setExpirationTimestamps(response.data.expiration_timestamps);
        let basicInfo = response.data.quote;
        basicInfo.tickerStats = response.data.ticker_stats;
        setBasicInfo(basicInfo);
        selected.external_cache_id = response.data.external_cache_id;
        selected.ticker_stats_id = response.data.ticker_stats.id;
        setSelectedTicker(selected);
        setModalActive(false);
    } catch (error) {
        console.error(error);
        setModalActive(false);
    }
};

// fetch tickers for new strategy screen and material ui
export async function newLoadTickers(headers, setAllTickers, setSelectedTicker, querySymbol, onTickerSelectionChange) {
    try {
        let recentTickers = localStorage.getItem('tigerstance-recent-tickers') || '';
        recentTickers = recentTickers.split(' ');

        const response = await Axios.get(`${getApiUrl()}/tickers/`, { headers });
        let visitedTickers = [];
        let restTickers = [];

        response.data.map((ticker) => {
            if (ticker.full_name) {
                ticker.display_label = ticker.symbol + ' - ' + ticker.full_name;
            } else {
                ticker.display_label = ticker.symbol;
            }

            if (querySymbol && ticker.symbol === querySymbol) {
                setSelectedTicker(ticker, onTickerSelectionChange("event", ticker));
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

export async function getTopMovers(headers) {
    try {
        const response = await Axios.get(`${getApiUrl()}/tickers/top_movers`, { headers });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export async function getPopularTickers(headers) {
    try {
        const response = await Axios.get(`${getApiUrl()}/tickers/popular`, { headers });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export function GetGaEventTrackingFunc(gaCategory) {
    return function GaEventTracking(gaAction) {
        ReactGA.event({ category: gaCategory, action: gaAction });
    }
}

export function GenerateTradeTitle(trade) {
    let call_strikes = [];
    let put_strikes = [];
    let expirations = [];
    let exps = new Set();
    trade.legs.forEach(leg => {
        if (leg.contract) {
            const contract = leg.contract;
            exps.add(contract.expiration);
            if (contract.is_call) {
                call_strikes.push(contract.strike);
            } else {
                put_strikes.push(contract.strike);
            }
        }
        expirations = Array.from(exps).sort();
    });
    return (
        <h4>
            {trade.stock.ticker.symbol}&nbsp;
            {expirations.map(exp => <span>{TimestampDateFormatter(exp)}, </span>)}
            {call_strikes.map((strike, idx) => idx === call_strikes.length - 1 ? `$${strike} Calls` : `$${strike}/`)}
            {put_strikes.map((strike, idx) => idx === put_strikes.length - 1 ? `$${strike} Puts` : `$${strike}/`)}:&nbsp;
            {startCase(trade.type)} with&nbsp;
            {trade.net_debit_per_unit >= 0 ? `$${Math.abs(trade.net_debit_per_unit)} net Debit` : `$${Math.abs(trade.net_debit_per_unit)} net Credit`}
        </h4>
    );
}