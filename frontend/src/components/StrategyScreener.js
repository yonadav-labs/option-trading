import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Axios from 'axios';
import getApiUrl, {
    PriceFormatter, TimestampDateFormatter, onLastTradedFilterChange, ProfitFormatter,
    PriceMovementFormatter, NumberRoundFormatter, PercentageFormatter,
    TimestampTimeFormatter, ContractDetails, getLegByName
} from '../utils';
import filterFactory, { multiSelectFilter, numberFilter } from 'react-bootstrap-table2-filter';
import { BsArrowsExpand, BsArrowsCollapse } from 'react-icons/bs';
import TickerTypeahead from './TickerTypeahead';
import TickerSummary from './TickerSummary.js';
import ModalSpinner from './ModalSpinner';
import Select from "react-select";

let lastTradedFilter;
let strategyFilter;

export default function BestCallByPrice() {
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const API_URL = getApiUrl();
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestStrategies, setBestStrategies] = useState([]);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);
    const [useAsPremium, setUseAsPremium] = useState('estimated');
    const [modalActive, setModalActive] = useState(false);

    const result_table_columns = [
        {
            dataField: "type",
            text: "Strategy",
            formatter: (cell, row, rowIndex, extraData) => {
                function getText(cell) {
                    switch (cell) {
                        case ("long_call"):
                            return "Long call";
                        case ("covered_call"):
                            return "Covered call"
                        case ("long_put"):
                            return "Long put"
                        case ("cash_secured_put"):
                            return "Cash secured put"
                    }
                }

                return (
                    <span>
                        {getText(cell)} <br />
                        <small>{TimestampDateFormatter(row.expiration)}</small>
                    </span>
                );
            },
            sort: true
        }, {
            dataField: "to_break_even_ratio",
            text: "Break even",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceMovementFormatter(cell, row.break_even_price)
            ),
            sort: true
        }, {
            dataField: "to_target_price_ratio",
            text: "Target price",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceMovementFormatter(cell, row.target_price)
            ),
        }, {
            dataField: "target_price_profit_ratio",
            text: "ROI at target",
            formatter: (cell, row, rowIndex, extraData) => (
                (
                    <span>{ProfitFormatter(cell)}</span>
                )
            ),
            sort: true
        }, {
            dataField: "target_price_profit",
            text: "Unit profit",
            formatter: (cell, row, rowIndex, extraData) => (
                (
                    <span>{cell > 0 ? '+' : '-'}{PriceFormatter(Math.abs(cell))}</span>
                )
            ),
            sort: true
        }, {
            dataField: "cost",
            text: "Unit cost",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceFormatter(cell)
            ),
            sort: true
        }, {
            dataField: 'last_trade_date',
            text: 'Last traded',
            formatter: (cell, row, rowIndex, extraData) => {
                if (cell == 0) return (<span>N/A</span>);
                const exp_date = new Date(cell * 1000).toLocaleDateString('en-US', { 'timeZone': 'EST' })
                const exp_time = new Date(cell * 1000).toLocaleTimeString('en-US', { 'timeZone': 'EST', hour: '2-digit', minute: '2-digit' })
                return (<span>{exp_date} <br /><small>{exp_time} EST</small></span>);
            },
            sort: true
        },
        // Below fields are hidden and used for filtering only.
        {
            dataField: 'last_trade_date2',
            text: 'last_trade_date2',
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    lastTradedFilter = filter;
                }
            })
        }, {
            dataField: "type2",
            text: "type2",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: multiSelectFilter({
                options: { 'long_call': 'long_call', 'covered_call': 'covered_call', 'long_put': 'long_put', 'cash_secured_put': 'cash_secured_put' },
                defaultValue: ['long_call', 'covered_call', 'long_put', 'cash_secured_put'],
                getFilter: (filter) => {
                    strategyFilter = filter;
                }
            })
        },
    ];
    const defaultSorted = [{
        dataField: "target_price_profit_ratio",
        order: "desc"
    }];

    function onStrategyFilterChange(event, strategyFilter) {
        const { value } = event.target;
        if (value == 'all') {
            strategyFilter(['long_call', 'covered_call', 'long_put', 'cash_secured_put']);
        } else {
            strategyFilter([value]);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        const formData = new FormData(event.target);
        const formDataObj = Object.fromEntries(formData.entries());

        setShowTimestampAlert(selectedExpirationTimestamps == null);
        if (form.checkValidity() !== false && selectedExpirationTimestamps != null) {
            getBestStrategies(formDataObj.target_price, selectedExpirationTimestamps);
        }
    };

    const handleUseAsPremiumChange = (event) => {
        const target = event.target;
        var value = target.value;
        setUseAsPremium(value);
    };

    const getBestStrategies = async (targetPrice, selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/trades/?target_price=${targetPrice}&`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp.value}&` });
            setModalActive(true);
            const response = await Axios.get(url);
            let trades = response.data.trades;
            trades.forEach(function (part, index, theArray) {
                theArray[index].type2 = theArray[index].type;
                theArray[index].last_trade_date2 = theArray[index].last_trade_date;
            });
            setBestStrategies(trades);
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    function StrategyInstructions(row) {
        switch (row.type) {
            case ("long_call"):
                const long_call_leg = getLegByName(row, 'long_call_leg');
                return (
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                Buy 1 {basicInfo.symbol} strike {PriceFormatter(long_call_leg.contract.strike)} {
                                    TimestampDateFormatter(row.expiration)} call at {PriceFormatter(long_call_leg.contract.premium)}.
                            </Card.Title>
                            <Card.Text>
                                {ContractDetails(long_call_leg.contract)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                );
            case ("covered_call"):
                const short_call_leg = getLegByName(row, 'short_call_leg');
                return (
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                Sell 1 {basicInfo.symbol} strike {PriceFormatter(short_call_leg.contract.strike)} {
                                    TimestampDateFormatter(row.expiration)} call at {PriceFormatter(short_call_leg.contract.premium)}.
                                </Card.Title>
                            <Card.Text>
                                {ContractDetails(short_call_leg.contract)}
                            </Card.Text>
                            <Card.Title>Buy 100 shares of {basicInfo.symbol} at {
                                PriceFormatter(basicInfo.regularMarketPrice)} and hold as collateral.</Card.Title>
                        </Card.Body>
                    </Card>
                );
            case ("long_put"):
                const long_put_leg = getLegByName(row, 'long_put_leg');
                return (
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                Buy 1 {basicInfo.symbol} strike {PriceFormatter(long_put_leg.contract.strike)} {
                                    TimestampDateFormatter(row.expiration)} put at {PriceFormatter(long_put_leg.contract.premium)}.
                            </Card.Title>
                            <Card.Text>
                                {ContractDetails(long_put_leg.contract)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                );
            case ("cash_secured_put"):
                const short_put_leg = getLegByName(row, 'short_put_leg');
                const long_cash_leg = getLegByName(row, 'long_cash_leg');
                return (
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                Sell 1 {basicInfo.symbol} strike {PriceFormatter(short_put_leg.contract.strike)} {
                                    TimestampDateFormatter(row.expiration)} call at {PriceFormatter(short_put_leg.contract.premium)}.
                                </Card.Title>
                            <Card.Text>
                                {ContractDetails(short_put_leg.contract)}
                            </Card.Text>
                            <Card.Title>Keep {PriceFormatter(long_cash_leg.units)} cash aside as collateral.</Card.Title>
                        </Card.Body>
                    </Card>
                );
        }
    }

    function ExpandTradeRow() {
        return {
            renderer: StrategyInstructions,
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

    const expirationTimestampsOptions = [];
    expirationTimestamps.map((timestamp, index) => {
        // Yahoo's timestamp * 1000 = TD's timestamp.
        const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
            .toLocaleDateString('en-US', { 'timeZone': 'EST' });
        expirationTimestampsOptions.push({ value: timestamp, label: date });
    })

    return (
        <div id="content" className="container min-vh-100" style={{ "marginTop": "4rem" }}>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <h1 className="text-center">Strategy Screener</h1>
            <Form>
                <Form.Group>
                    <Form.Label className="requiredField"><h4>Enter ticker symbol:</h4></Form.Label>
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        setModalActive={setModalActive}
                    />
                </Form.Group>
            </Form>
            {selectedTicker.length > 0 ?
                <div>
                    <TickerSummary basicInfo={basicInfo} />
                    <div>
                        <h4>Configurations</h4>
                        <hr />
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label className="font-weight-bold">Target price on expiration date (USD)*:</Form.Label>
                                <Form.Control name="target_price" as="input" type="number" placeholder="100.0" min="0.0" max="10000.0" step="0.01" required />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="font-weight-bold">Expiration Dates:*:</Form.Label>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Select
                                            defaultValue={selectedExpirationTimestamps}
                                            isMulti
                                            isClearable
                                            onChange={setSelectedExpirationTimestamps}
                                            options={expirationTimestampsOptions}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        {showTimestampAlert ?
                                            <Alert variant="warning">
                                                Please select at least one expiration date.
                                        </Alert>
                                            : null
                                        }
                                    </div>
                                </div>
                            </Form.Group>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Form.Group>
                                        <Form.Label className="font-weight-bold">Premium price options:</Form.Label>
                                        <Form.Control name="use_as_premium" as="select" defaultValue="estimated"
                                            onChange={handleUseAsPremiumChange}>
                                            <option key="estimated" value="estimated">Use estimated mid price</option>
                                            <option key="bid" value="bid">Use bid (buyer's) price</option>
                                            <option key="ask" value="ask">Use ask (seller's) price</option>
                                        </Form.Control>
                                    </Form.Group>
                                </div>
                            </div>
                            <div class="row">
                                <div className="col">
                                    <Button type="submit" className="btn btn-primary">Analyze</Button>
                                </div>
                            </div>
                        </Form>
                        <br />
                        {bestStrategies.length > 0 ?
                            <div>
                                <h4>Results</h4>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Filter by last traded:</Form.Label>
                                                <Form.Control name="tradeoff" as="select" defaultValue={0}
                                                    onChange={(e) => onLastTradedFilterChange(e, lastTradedFilter)}>
                                                    <option key="9999999" value="9999999">All</option>
                                                    {[1, 4, 8, 24, 48, 72, 120, 240].map((hour, index) => {
                                                        return (
                                                            <option key={hour} value={hour}>
                                                                Last traded in&nbsp;
                                                                {(hour <= 24 ? hour + (hour > 1 ? " hours" : " hour") : hour / 24 + " days")}
                                                            </option>
                                                        );
                                                    })}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-3">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Strategy:</Form.Label>
                                                <Form.Control name="strategy" as="select" defaultValue="all"
                                                    onChange={(e) => onStrategyFilterChange(e, strategyFilter)}>
                                                    <option key="all" value="all">All</option>
                                                    <option key="long_call" value="long_call">Long call</option>
                                                    <option key="covered_call" value="covered_call">Covered call</option>
                                                    <option key="long_put" value="long_put">Long put</option>
                                                    <option key="cash_secured_put" value="cash_secured_put">Cash secured put</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-4">
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <BootstrapTable
                                            classes="table-responsive"
                                            bootstrap4={true}
                                            keyField="contract_symbol"
                                            data={bestStrategies}
                                            columns={result_table_columns}
                                            pagination={paginationFactory({
                                                sizePerPage: 20,
                                                hidePageListOnlyOnePage: true
                                            })}
                                            noDataIndication="No Data"
                                            bordered={false}
                                            expandRow={ExpandTradeRow()}
                                            filter={filterFactory()}
                                            defaultSorted={defaultSorted}
                                        />
                                    </div>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div >
                </div>
                :
                null
            }
        </div >
    );
}