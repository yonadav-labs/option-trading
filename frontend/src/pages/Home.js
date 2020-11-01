import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import TradingViewWidget from 'react-tradingview-widget';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import TickerTypeahead from '../components/TickerTypeahead';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Axios from 'axios';
import getApiUrl from '../utils';
import NumberFormat from 'react-number-format';

export default function Home() {
    const API_URL = getApiUrl();
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestCalls, setBestCalls] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    let selectedExpirationTimestamps = [];
    const tradeoffOptions = [{ value: 0, label: 'No tradeoff' },
    { value: 0.005, label: 'Trade 0.5% gain for 1 month additional expiration time' },
    { value: 0.01, label: 'Trade 1% gain for 1 month additional expiration time' },
    { value: 0.02, label: 'Trade 2% gain for 1 month additional expiration time' },
    { value: 0.03, label: 'Trade 3% gain for 1 month additional expiration time' },
    { value: 0.04, label: 'Trade 4% gain for 1 month additional expiration time' },
    { value: 0.05, label: 'Trade 5% gain for 1 month additional expiration time' },
    { value: 0.06, label: 'Trade 6% gain for 1 month additional expiration time' },
    { value: 0.07, label: 'Trade 7% gain for 1 month additional expiration time' },
    { value: 0.08, label: 'Trade 8% gain for 1 month additional expiration time' },
    { value: 0.09, label: 'Trade 9% gain for 1 month additional expiration time' },
    { value: 0.1, label: 'Trade 10% gain for 1 month additional expiration time' },];
    const columns = [
        {
            dataField: 'contract_symbol',
            text: 'Contract Symbol',
        }, {
            dataField: "expiration",
            text: "Expiration",
        }, {
            dataField: "days_till_expiration",
            text: "Days Remaining",
        }, {
            dataField: "strike",
            text: "Strike",
        }, {
            dataField: "estimated_price",
            text: "Premium",
        }, {
            dataField: "break_even_price",
            text: "Breakeven Point",
        }, {
            dataField: "gain",
            text: "Option Gain",
        }, {
            dataField: "stock_gain",
            text: "Stock Gain",
        }, {
            dataField: "normalized_score",
            text: "Final Score",
            sort: true,
        }];

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        const formData = new FormData(event.target);
        const formDataObj = Object.fromEntries(formData.entries());

        if (selectedExpirationTimestamps.length > 0) {
            setShowTimestampAlert(false);
        } else {
            setShowTimestampAlert(true);
        }

        if (form.checkValidity() !== false && selectedExpirationTimestamps.length > 0) {
            getBestCalls(selectedTicker[0].symbol, formDataObj.target_price, selectedExpirationTimestamps, formDataObj.tradeoff);
        }
    };

    const handleInputChange = (event) => {
        const target = event.target;
        var value = target.value;

        if (target.checked) {
            selectedExpirationTimestamps.push(value);
        } else {
            selectedExpirationTimestamps.splice(selectedExpirationTimestamps.indexOf(value), 1);
        }

    };

    const getBestCalls = async (selectedTicker, targetPrice, selectedExpirationTimestamps, tradeoff) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker}/calls/?target_price=${targetPrice}&`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp}&` });
            url += `month_to_percent_gain=${tradeoff}`
            const response = await Axios.get(url);
            let all_calls = response.data.all_calls;
            all_calls.forEach(function (row) {
                const precent_gain = Math.round(row.gain * 100);
                row.gain = `${precent_gain}%`;
                const precent_stock_gain = Math.round(row.stock_gain * 100);
                row.stock_gain = `${precent_stock_gain}%`;
                row.break_even_price = `$${row.break_even_price}`;
                row.estimated_price = `$${row.estimated_price}`;
                row.strike = `$${row.strike}`;
            });
            setBestCalls(all_calls)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div id="content">
            <Form>
                <Form.Group>
                    <Form.Label className="requiredField"><b>Enter ticker symbol</b>*</Form.Label>
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                    />
                </Form.Group>
            </Form>
            {selectedTicker.length > 0 ?
                <div>
                    <h4>Summary</h4>
                    <div className="row">
                        <div className="col-sm"><b>{basicInfo.shortName} ({basicInfo.symbol})</b></div>
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
                    <br></br>
                    <Accordion>
                        <Card>
                            <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                Price Chart
                    </Accordion.Toggle>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    <TradingViewWidget
                                        symbol={selectedTicker.length > 0 ? selectedTicker[0].symbol : ""}
                                    />
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                    <br />
                    <h4>Best call options to buy</h4>
                    <hr />
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Target price (USD)*</Form.Label>
                            <Form.Control name="target_price" as="input" type="number" placeholder="100.0" min="0.0" required />
                        </Form.Group>
                        <Form.Group>
                            {showTimestampAlert ?
                                <Alert variant="warning">
                                    Please select at least one expiration date.
                                </Alert>
                                :
                                null
                            }
                            <Form.Label>Expiration Dates*</Form.Label>
                            <div className="row">
                                {expirationTimestamps.map((timestamp) => {
                                    const date = new Date(timestamp * 1000).toLocaleDateString();
                                    return (
                                        <div className="col-sm-6">
                                            <Form.Check
                                                value={timestamp}
                                                name={`expiration_date_${timestamp}`}
                                                type="checkbox"
                                                id={`checkbox-${timestamp}`}
                                                label={date}
                                                onChange={handleInputChange}
                                            />
                                        </div>);
                                })}
                            </div>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Month to percentage gain tradeoff*</Form.Label>
                            <Form.Control name="tradeoff" as="select" defaultValue={0} required>
                                {
                                    tradeoffOptions.map((option, index) => {
                                        return (<option key={index} value={option.value}>{option.label}</option>)
                                    })
                                }
                            </Form.Control>
                        </Form.Group>
                        <Button type="submit">Analyze</Button>
                    </Form>
                    <br />
                    <BootstrapTable classes="table-responsive" bootstrap4={true} keyField="contract_symbol" data={bestCalls} columns={columns} pagination={paginationFactory()} />
                </div>
                :
                null
            }
        </div>
    );
}