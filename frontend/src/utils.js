import React from 'react';
import NumberFormat from 'react-number-format';

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
    return (<span>{TimestampFormatter(ts)} ({days_till_expiration} days)</span>);
};