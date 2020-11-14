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

export function PercentageFormatter(num) {
    return (<NumberFormat value={num * 100} displayType={'text'} decimalScale={2} suffix={'%'} />);
};

export function PriceFormatter(num) {
    return (<NumberFormat value={num} displayType={'text'} thousandSeparator={true} decimalScale={2} prefix={'$'} />);
};

export function PercentageWithAnnualizedFormatter(num, annualized_num) {
    return (<span>
        <NumberFormat value={num * 100} displayType={'text'} decimalScale={2} suffix={'%'} />
        &nbsp;(<NumberFormat value={annualized_num * 100} displayType={'text'} decimalScale={2} suffix={'%'} /> in APR)
    </span>)
};

export function TimestampFormatter(ts) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' })
    return (<span>{exp_date}</span>);
};

export function TimestampWithDaysFormatter(ts, days_till_expiration) {
    const exp_date = new Date(ts * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' })
    return (<span>{exp_date} ({days_till_expiration} days)</span>);
};