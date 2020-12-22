import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import TickerTypeahead from './TickerTypeahead';
import TickerSummary from './TickerSummary.js';
import Axios from 'axios';
import getApiUrl, {
    PriceFormatter, TimestampDateFormatter, ExpandContractRow, InTheMoneyRowStyle,
    InTheMoneySign, onInTheMoneyFilterChange, onLastTradedFilterChange,
    PercentageFormatter, PriceMovementFormatter, NumberRoundFormatter
} from '../utils';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { multiSelectFilter, numberFilter } from 'react-bootstrap-table2-filter';
import ModalSpinner from './ModalSpinner';
import { Comparator } from 'react-bootstrap-table2-filter';

let putCallFilter;
let inTheMoneyFilter;
let lastTradedFilter;
let minVolumeFilter;
let minOpenInterestFilter;
let minDeltaFilter;
let maxDeltaFilter;
let minLeverageFilter;

export default function SellCoveredCall() {
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);
    const [modalActive, setModalActive] = useState(false);

    const resetStates = () => {
        setSelectedTicker([]);
        setExpirationTimestamps([]);
        setbasicInfo({});
        setShowTimestampAlert(false);
        setContracts([]);
        setModalActive(false);
        setSelectedExpirationTimestamps([]);
    }

    const API_URL = getApiUrl();

    const result_table_columns = [
        {
            dataField: 'is_call',
            text: 'Type',
            formatter: (cell, row, rowIndex, extraData) => (
                cell ? 'Call' : 'Put'
            ),
        }, {
            dataField: "to_strike_ratio",
            text: "Strike",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceMovementFormatter(cell, row.strike)
            ),
            sort: true,
        }, {
            dataField: "premium",
            text: "Premium",
            formatter: (cell, row, rowIndex, extraData) => (
                (
                    <span>
                        {PriceFormatter(cell)}<br />
                        <small>{PriceFormatter(row.bid)} / {PriceFormatter(row.ask)}</small>
                    </span>
                )
            ),
            sort: true
        }, {
            dataField: "to_break_even_ratio",
            text: "Break Even",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceMovementFormatter(cell, row.break_even_price)
            ),
            sort: true
        }, {
            dataField: "leverage",
            text: "Buyer leverage",
            formatter: (cell, row, rowIndex, extraData) => (
                (<span>{PercentageFormatter(cell)}<br /><small>If {row.is_call ? 'above' : 'below'} {PriceFormatter(row.strike)}</small></span>)
            ),
            sort: true
        }, {
            dataField: "seller_roi",
            text: "Seller ROI",
            formatter: (cell, row, rowIndex, extraData) => (
                (<span>{PercentageFormatter(cell)}<br /><small>If {row.is_call ? 'below' : 'above'} {PriceFormatter(row.strike)}</small></span>)
            ),
            sort: true
        }, {
            dataField: "volume",
            text: "Liquidity",
            formatter: (cell, row, rowIndex, extraData) => (
                (
                    <span>
                        Volume: {NumberRoundFormatter(cell, row)}<br />
                        <small>Open: {NumberRoundFormatter(row.open_interest, row)}</small>
                    </span>
                )
            ),
            sort: true
        }, {
            dataField: "expiration",
            text: "Expiration",
            formatter: (cell, row, rowIndex, extraData) => (
                (
                    <span>
                        {TimestampDateFormatter(cell)} <br />
                        <small>{row.days_till_expiration} days</small>
                    </span>
                )
            )
        }, {
            dataField: "delta",
            text: "Delta",
            formatter: (cell, row, rowIndex, extraData) => (
                NumberRoundFormatter(cell, row)
            ),
            sort: true
        },
        // Below fields are hidden and used for filtering only.
        {
            dataField: 'in_the_money',
            text: 'in_the_money',
            // hidden: true, getFilter() won't be called if hidden is true.
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: multiSelectFilter({
                options: { true: 'ITM', false: 'OTM' },
                defaultValue: [true, false],
                getFilter: (filter) => {
                    inTheMoneyFilter = filter;
                }
            })
        }, {
            dataField: 'last_trade_date',
            text: 'last_trade_date',
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    lastTradedFilter = filter;
                }
            })
        }, {
            dataField: 'is_call_dup',
            text: 'is_call_dup',
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: multiSelectFilter({
                options: { true: 'call', false: 'put' },
                defaultValue: [true, false],
                getFilter: (filter) => {
                    putCallFilter = filter;
                }
            })
        }, {
            dataField: "min_volume",
            text: "min_volume",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    minVolumeFilter = filter;
                }
            })
        }, {
            dataField: "open_interest",
            text: "open_interest",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    minOpenInterestFilter = filter;
                }
            })
        }, {
            dataField: "min_delta",
            text: "min_delta",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    minDeltaFilter = filter;
                }
            })
        }, {
            dataField: "max_delta",
            text: "max_delta",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    maxDeltaFilter = filter;
                }
            })
        }, {
            dataField: "min_leverage",
            text: "min_leverage",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    minLeverageFilter = filter;
                }
            })
        },
    ];
    const defaultSorted = [{
        dataField: "is_call",
        order: "asc"
    }, {
        dataField: "to_strike_ratio",
        order: "asc"
    }];

    function onPutCallChange(event, putCallFilter) {
        const { value } = event.target;
        if (value == 'all') {
            putCallFilter([true, false]);
        } else if (value == 'put') {
            putCallFilter([false]);
        } else if (value == 'call') {
            putCallFilter([true]);
        }
    };

    function onVolumeFilterChange(event, volumeFilter) {
        const { value } = event.target;
        volumeFilter({
            number: value,
            comparator: Comparator.GE
        });
    };

    function onOpenInterestFilterChange(event, openInterestFilter) {
        const { value } = event.target;
        openInterestFilter({
            number: value,
            comparator: Comparator.GE
        });
    };

    function onDeltaFilterChange(event, minDeltaFilter, maxDeltaFilter) {
        const { value } = event.target;
        let min_delta = value != 'all' ? parseFloat(value) : -1.0;
        let max_delta = value != 'all' ? min_delta + 0.2 : 1.0;
        minDeltaFilter({
            number: min_delta,
            comparator: Comparator.GE
        });
        maxDeltaFilter({
            number: max_delta,
            comparator: Comparator.LE
        });
    };

    function onMinLeverageFilterChange(event, minLeverageFilter) {
        const { value } = event.target;
        minLeverageFilter({
            number: value,
            comparator: Comparator.GE
        });
    };

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
            getContracts(selectedExpirationTimestamps);
        }
    };

    const handleInputChange = (event) => {
        const target = event.target;
        var value = target.value;

        if (target.checked) {
            setSelectedExpirationTimestamps(selectedExpirationTimestamps.concat([value]));
        } else {
            setSelectedExpirationTimestamps(selectedExpirationTimestamps.filter(item => item !== value));
        }
    };

    const getContracts = async (selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/contracts/?`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp}` });
            setModalActive(true);
            const response = await Axios.get(url);
            let contracts = response.data.contracts;
            contracts.forEach(function (part, index, theArray) {
                // Duplicate fields for table filtering.
                theArray[index].is_call_dup = theArray[index].is_call;
                theArray[index].min_volume = theArray[index].volume;
                theArray[index].min_delta = theArray[index].delta;
                theArray[index].max_delta = theArray[index].delta;
                theArray[index].min_leverage = theArray[index].leverage;
            });
            setContracts(contracts);
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    return (
        <div id="content" className="container" style={{ "marginTop": "4rem" }}>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <h1 className="text-center">Option screener</h1>
            <Form>
                <Form.Group>
                    <Form.Label className="requiredField"><h5>Enter ticker symbol:</h5></Form.Label>
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        resetStates={resetStates}
                        setModalActive={setModalActive}
                    />
                </Form.Group>
            </Form>
            {selectedTicker.length > 0 ?
                <div>
                    <TickerSummary basicInfo={basicInfo} />
                    <div>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                {showTimestampAlert ?
                                    <Alert variant="warning">
                                        Please select at least one expiration date.
                                </Alert>
                                    :
                                    null
                                }
                                <Form.Label className="font-weight-bold">Expiration Dates:</Form.Label>
                                <div className="row">
                                    {expirationTimestamps.map((timestamp, index) => {
                                        // Yahoo's timestamp * 1000 = TD's timestamp.
                                        const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
                                            .toLocaleDateString('en-US', { 'timeZone': 'GMT' });
                                        return (
                                            <div className="col-sm-3" key={index}>
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
                            <div class="row">
                                <div className="col">
                                    <Button type="submit" className="btn btn-dark">Get option chain</Button>
                                </div>
                            </div>
                        </Form>
                        <br />
                        {contracts.length > 0 ?
                            <div>
                                <h5>Filters</h5>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Put or call:</Form.Label>
                                                <Form.Control name="tradeoff" as="select" defaultValue={0}
                                                    onChange={(e) => onPutCallChange(e, putCallFilter)}>
                                                    <option key="all" value="all">All</option>
                                                    <option key="put" value="put">Put</option>
                                                    <option key="call" value="call">Call</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Strike:</Form.Label>
                                                <Form.Control name="tradeoff" as="select" defaultValue={0}
                                                    onChange={(e) => onInTheMoneyFilterChange(e, inTheMoneyFilter)}>
                                                    <option key="all" value="all">All</option>
                                                    <option key="itm" value="itm">In the money</option>
                                                    <option key="otm" value="otm">Out of the money</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Min volume:</Form.Label>
                                                <Form.Control name="volume" as="select" defaultValue={0}
                                                    onChange={(e) => onVolumeFilterChange(e, minVolumeFilter)}>
                                                    <option key="0" value="0">All</option>
                                                    {[1, 5, 10, 20, 50, 100, 200, 500, 1000, 10000].map((v, index) => {
                                                        return (
                                                            <option key={v} value={v}>{v}</option>
                                                        );
                                                    })}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Min open interest:</Form.Label>
                                                <Form.Control name="open_interest" as="select" defaultValue={0}
                                                    onChange={(e) => onOpenInterestFilterChange(e, minOpenInterestFilter)}>
                                                    <option key="0" value="0">All</option>
                                                    {[1, 5, 10, 20, 50, 100, 200, 500, 1000, 10000].map((v, index) => {
                                                        return (
                                                            <option key={v} value={v}>{v}</option>
                                                        );
                                                    })}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Last traded:</Form.Label>
                                                <Form.Control name="tradeoff" as="select" defaultValue={0}
                                                    onChange={(e) => onLastTradedFilterChange(e, lastTradedFilter)}>
                                                    <option key="9999999" value="9999999">All</option>
                                                    {[1, 4, 8, 24, 48, 72, 120, 240].map((hour, index) => {
                                                        return (
                                                            <option key={hour} value={hour}>
                                                                In&nbsp;
                                                                {(hour <= 24 ? hour + (hour > 1 ? " hours" : " hour") : hour / 24 + " days")}
                                                            </option>
                                                        );
                                                    })}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-2">
                                        {InTheMoneySign()}
                                    </div>
                                </div>
                                <div class="row">
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Delta:</Form.Label>
                                                <Form.Control name="delta" as="select" defaultValue="all"
                                                    onChange={(e) => onDeltaFilterChange(e, minDeltaFilter, maxDeltaFilter)}>
                                                    <option key="all" value="all">All</option>
                                                    <option key="-1" value="-1">-1.0 to -0.8</option>
                                                    <option key="-0.8" value="-0.8">-0.8 to -0.6</option>
                                                    <option key="-0.6" value="-0.6">-0.6 to -0.4</option>
                                                    <option key="-0.4" value="-0.4">-0.4 to -0.2</option>
                                                    <option key="-0.2" value="-0.2">-0.2 to 0.0</option>
                                                    <option key="0" value="0">0.0 to 0.2</option>
                                                    <option key="0.2" value="0.2">0.2 to 0.4</option>
                                                    <option key="0.4" value="0.4">0.4 to 0.6</option>
                                                    <option key="0.6" value="0.6">0.6 to 0.8</option>
                                                    <option key="0.8" value="0.8">0.8 to 1.0</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-2">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Min buyer leverage:</Form.Label>
                                                <Form.Control name="delta" as="select" defaultValue="0"
                                                    onChange={(e) => onMinLeverageFilterChange(e, minLeverageFilter)}>
                                                    <option key="1" value="1">All</option>
                                                    <option key="1.5" value="1.5">1.5X</option>
                                                    <option key="2" value="2">2X</option>
                                                    <option key="5" value="5">5X</option>
                                                    <option key="10" value="10">10X</option>
                                                    <option key="20" value="20">20X</option>
                                                    <option key="50" value="50">50X</option>
                                                    <option key="100" value="100">100X</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                </div>
                                <BootstrapTable
                                    classes="table-responsive"
                                    bootstrap4={true}
                                    keyField="contract_symbol"
                                    data={contracts}
                                    columns={result_table_columns}
                                    pagination={paginationFactory({
                                        sizePerPage: 20,
                                        hidePageListOnlyOnePage: true
                                    })}
                                    noDataIndication="No Data"
                                    bordered={false}
                                    // overlay={overlayFactory({ spinner: true })} // does not work with filter.
                                    expandRow={ExpandContractRow()}
                                    rowStyle={InTheMoneyRowStyle}
                                    filter={filterFactory()}
                                    defaultSorted={defaultSorted}
                                />
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
                :
                null
            }
        </div>
    );
}