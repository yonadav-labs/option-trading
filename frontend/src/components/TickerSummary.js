import React, { useContext, useState } from 'react';
import TradingViewWidget from 'react-tradingview-widget';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import NumberFormat from 'react-number-format';
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import UserContext from '../UserContext';
import getApiUrl from '../utils';
import Axios from 'axios';

export default function TickerSummary({ basicInfo }) {
    const { user, setUser } = useContext(UserContext);
    const [onWatchlist, setOnWatchlist] = useState(user ? user.watchlist.includes(basicInfo.symbol) : false);
    const API_URL = getApiUrl();

    const updateWatchlist = async () => {
        try {
            // TODO fix this put
            const response = await Axios.put(`${API_URL}/watchlist?user=${user.id}`);
            setUser(response.data, setOnWatchlist(user.watchlist.includes(basicInfo.symbol)));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="row">
                <h4>Summary</h4>
                <ButtonGroup toggle className="mb-2 ml-auto">
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
                </ButtonGroup>
            </div>

            <div className="row">
                <div className="col-sm"><b>{basicInfo.symbol} - {basicInfo.shortName}</b></div>
            </div>
            <div className="row">
                <div className="col-sm">Last price: <NumberFormat value={basicInfo.regularMarketPrice} displayType={'text'} thousandSeparator={true} prefix={'$'} /></div>
                <div className="col-sm">52 Week Range:
                        <NumberFormat value={basicInfo.fiftyTwoWeekLow} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                         -
                        <NumberFormat value={basicInfo.fiftyTwoWeekHigh} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm">Market Cap: <NumberFormat value={basicInfo.marketCap} displayType={'text'} thousandSeparator={true} prefix={'$'} /></div>
                <div className="col-sm">Outstanding Shares: <NumberFormat value={basicInfo.sharesOutstanding} displayType={'text'} thousandSeparator={true} /></div>
            </div>
            <br />
            <Accordion>
                <Card>
                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                        Price Chart
                            </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <TradingViewWidget
                                symbol={basicInfo.symbol}
                            />
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
            <br />
        </div >
    );
}