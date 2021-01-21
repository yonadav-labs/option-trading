import React, { useContext, useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import UserContext from '../UserContext';
import getApiUrl from '../utils';
import Axios from 'axios';
import TradingWidget from './TradingWidget';

// Bootstrap
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import {Row, Col, Badge} from 'react-bootstrap';


export default function TickerSummary({ basicInfo }) {
    /*
    const { user, setUser } = useContext(UserContext);
    const [onWatchlist, setOnWatchlist] = useState(user ? user.watchlist.includes(basicInfo.symbol) : false);
    const API_URL = getApiUrl();
    useEffect(() => {
        setOnWatchlist(user ? user.watchlist.includes(basicInfo.symbol) : false);
    }, [basicInfo]);
    const updateWatchlist = async () => {
        try {
            if (onWatchlist) {
                const newWatchlist = user.watchlist.filter(item => item !== basicInfo.symbol);
                user.watchlist = newWatchlist;
            } else {
                user.watchlist.push(basicInfo.symbol);
            }
            console.log(user);
            const response = await Axios.put(`${API_URL}/users/${user.okta_id}`, user);
            setUser(response.data, setOnWatchlist(user.watchlist.includes(basicInfo.symbol)));
        } catch (error) {
            console.error(error);
        }
    };
    */

    // https://stackoverflow.com/a/32638472/14903155
    function intToString(num, fixed) {
        if (num === null) { return null; } // terminate early
        if (num === 0) { return '0'; } // terminate early
        fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
        var b = (num).toPrecision(2).split("e"), // get power
            k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
            c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
            d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
            e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
        return e;
    }

    return (
        <div>
            <div className="row">
                <div className="col-sm"><h5>{basicInfo.symbol} - {basicInfo.shortName}</h5></div>
                {/* <ButtonGroup toggle className="mb-2 ml-auto">
                    <ToggleButton
                        type="checkbox"
                        variant="outline-primary"
                        size="sm"
                        checked={onWatchlist}
                        value={basicInfo.symbol}
                        onChange={(e) => updateWatchlist()}
                    >
                        {onWatchlist ? "-" : "+"}
                    </ToggleButton>
                </ButtonGroup> */}
            </div>
            <div>
                <Row>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">Last Price</Badge>
                            <br/>
                            <h4> {basicInfo.regularMarketPrice ? `$${basicInfo.regularMarketPrice}` : "N/A"} </h4>
                        </div>
                    </Col>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">Day Range</Badge>
                            <br/>
                            <h4> 
                                {basicInfo.regularMarketDayLow && basicInfo.regularMarketDayHigh ? `${basicInfo.regularMarketDayLow.toFixed(2)}-${basicInfo.regularMarketDayHigh.toFixed(2)}` : "N/A"} 
                            </h4>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">52 Week Range</Badge>
                            <br/>
                            <h4> {basicInfo.fiftyTwoWeekLow && basicInfo.fiftyTwoWeekHigh ? `${basicInfo.fiftyTwoWeekLow.toFixed(2)}-${basicInfo.fiftyTwoWeekHigh.toFixed(2)}` : "N/A"} </h4>
                        </div>
                    </Col>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">Market Cap</Badge>
                            <br/>
                            <h4> {basicInfo.marketCap ? `$${intToString(basicInfo.marketCap, 1)}` : "N/A"} </h4>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">Average Volume</Badge>
                            <br/>
                            <h4> {basicInfo.averageDailyVolume3Month ? intToString(basicInfo.averageDailyVolume3Month, 1) : "N/A"} </h4>
                        </div>
                    </Col>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">Outstanding Shares</Badge>
                            <br/>
                            <h4> {basicInfo.sharesOutstanding ? intToString(basicInfo.sharesOutstanding, 1) : "N/A"} </h4>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">P/E</Badge>
                            <br/>
                            <h4> {basicInfo.trailingPE ? basicInfo.trailingPE.toFixed(2) : "N/A"} </h4>
                        </div>
                    </Col>
                    <Col s={6}>
                        <div>
                            <Badge variant="secondary">EPS</Badge>
                            <br/>
                            <h4> {basicInfo.epsTrailingTwelveMonths ? `$${basicInfo.epsTrailingTwelveMonths.toFixed(2)}` : "N/A"} </h4>
                        </div>
                    </Col>
                </Row>
            </div>
            <TradingWidget symbol={basicInfo.symbol}/>
            <br />
        </div >
    );
}