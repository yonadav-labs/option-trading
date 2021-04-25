import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import TickerTypeahead from '../components/TickerTypeahead';
import TickerSummary from '../components/TickerSummary.js';
import Axios from 'axios';
import { useOktaAuth } from '@okta/okta-react';
import getApiUrl, {
    PriceFormatter, TimestampDateFormatter, InTheMoneyRowStyle,
    InTheMoneySign, PriceMovementFormatter, NumberRoundFormatter,
    loadTickers, loadExpirationDates, GetGaEventTrackingFunc
} from '../utils';
import { BsArrowsExpand, BsArrowsCollapse } from 'react-icons/bs';
import ModalSpinner from '../components/ModalSpinner';
import ContractDetailsCard from '../components/cards/ContractDetailsCard';
import Select from "react-select";
import TradingViewWidget from 'react-tradingview-widget';

// Bootstrap
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { multiSelectFilter, numberFilter, Comparator } from 'react-bootstrap-table2-filter';
import { Form, Button, Alert, Container, Row, Col, Accordion, Card } from 'react-bootstrap';

// Filters
import StrikeRangeSliderFilter from "../components/filters/StrikeRangeSliderFilter";
import ButtonToggleFilter from '../components/filters/ButtonToggleFilter';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from '../components/querying';

let putCallFilter;
let inTheMoneyFilter;
let lastTradedFilter;
let minVolumeFilter;
let minOpenInterestFilter;
let minDeltaFilter;
let maxDeltaFilter;
let minStrikeFilter;
let maxStrikeFilter;

const GaEvent = GetGaEventTrackingFunc('options screener');

export default function SellCoveredCall() {
    const API_URL = getApiUrl();
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [strikePrices, setStrikePrices] = useState([]);
    const [headers, setHeaders] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker([]);
        setExpirationTimestamps([]);
        setbasicInfo({});
        setShowTimestampAlert(false);
        setContracts([]);
        setModalActive(false);
        setSelectedExpirationTimestamps([]);
    }

    const onTickerSelectionChange = (selected) => {
        GaEvent('adjust ticker');
        if (selected.length > 0) {
            loadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setbasicInfo, setSelectedTicker);
            addQuery(location, history, 'symbol', selected[0].symbol)
        }
        if (resetStates) {
            resetStates([]);
        }
    };

    useEffect(() => {
        if (authState.isAuthenticated) {
            const { accessToken } = authState;
            setHeaders({ Authorization: `Bearer ${accessToken.accessToken}` });
        } else {
            setHeaders({});
        }
    }, [oktaAuth, authState]);

    useEffect(() => {
        if (headers) {
            loadTickers(headers, setSelectedTicker, setAllTickers, querySymbol, onTickerSelectionChange);
        }
    }, [headers]);

    const headerSortingStyle = { backgroundColor: '#FF8F2B' };
    const result_table_columns = [
        {
            dataField: 'is_call',
            text: 'Type',
            formatter: (cell, row, rowIndex, extraData) => (
                cell ? 'Call' : 'Put'
            ),
            sort: true,
            headerSortingStyle,
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
            ),
            sort: true,
            headerSortingStyle,
        }, {
            dataField: "to_strike_ratio",
            text: "Strike",
            formatter: (cell, row, rowIndex, extraData) => (
                <span>
                    At {PriceMovementFormatter(cell, row.strike)}
                </span>
            ),
            sort: true,
            headerSortingStyle,
        }, {
            dataField: "mark",
            text: "Mid/mark premium",
            formatter: (cell, row, rowIndex, extraData) => (
                (
                    <span>
                        {PriceFormatter(cell)}<br />
                        <small>{PriceFormatter(row.bid)} / {PriceFormatter(row.ask)}</small>
                    </span>
                )
            ),
            sort: true,
            headerSortingStyle,
        }, {
            dataField: "to_break_even_ratio",
            text: "Break even",
            formatter: (cell, row, rowIndex, extraData) => (
                <span>
                    At {PriceMovementFormatter(cell, row.break_even_price)}
                </span>
            ),
            sort: true,
            headerSortingStyle,
        }, {
            dataField: "volume",
            text: "Volume",
            sort: true,
            headerSortingStyle,
        }, {
            dataField: "open_interest",
            text: "Open interest",
            sort: true,
            headerSortingStyle,
        }, {
            dataField: "delta",
            text: "Delta",
            formatter: (cell, row, rowIndex, extraData) => (
                NumberRoundFormatter(cell, row)
            ),
            sort: true,
            headerSortingStyle,
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
            dataField: "min_strike",
            text: "min_strike",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    minStrikeFilter = filter;
                }
            })
        }, {
            dataField: "max_strike",
            text: "max_strike",
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    maxStrikeFilter = filter;
                }
            })
        },
    ];
    const defaultSorted = [{
        dataField: "expiration",
        order: "asc"
    }, {
        dataField: "is_call",
        order: "asc"
    }, {
        dataField: "to_strike_ratio",
        order: "asc"
    }];

    function onVolumeFilterChange(event, volumeFilter) {
        const { value } = event.target;
        volumeFilter({
            number: value,
            comparator: Comparator.GE
        });
        GaEvent('adjust volume filter');
    };

    function onOpenInterestFilterChange(event, openInterestFilter) {
        const { value } = event.target;
        openInterestFilter({
            number: value,
            comparator: Comparator.GE
        });
        GaEvent('adjust open interest filter');
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
        GaEvent('adjust delta filter');
    };

    function onLastTradedFilterChange(event, lastTradedFilter) {
        const { value } = event.target;
        lastTradedFilter({
            number: Date.now() / 1000 - value * 3600,
            comparator: Comparator.GT
        });
        GaEvent('adjust last traded filter');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        const formData = new FormData(event.target);
        const formDataObj = Object.fromEntries(formData.entries());

        // push dates to url query
        // let timestampValues = []
        // selectedExpirationTimestamps.forEach( t => timestampValues.push(t.value))
        // addQuery(location, history, `date`, timestampValues.join(','))

        if (!selectedExpirationTimestamps || selectedExpirationTimestamps[0] === undefined) {
            setShowTimestampAlert(true);
            return;
        } else {
            setShowTimestampAlert(false);
        }

        setShowTimestampAlert(selectedExpirationTimestamps == null);
        if (form.checkValidity() !== false && selectedExpirationTimestamps != null) {
            getContracts(selectedExpirationTimestamps);
        }
    };

    const getContracts = async (selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/contracts/`;
            let body = {
                expiration_timestamps: selectedExpirationTimestamps.reduce((a, b) => a.concat(b.value), []),
                filters: {}
            };
            setModalActive(true);
            const response = await Axios.post(url, body);
            let contracts = response.data.contracts;
            let strikes = [];
            contracts.forEach(function (part, index, theArray) {
                // Duplicate fields for table filtering.
                theArray[index].is_call_dup = theArray[index].is_call;
                theArray[index].min_volume = theArray[index].volume;
                theArray[index].min_delta = theArray[index].delta;
                theArray[index].max_delta = theArray[index].delta;
                theArray[index].min_strike = theArray[index].strike;
                theArray[index].max_strike = theArray[index].strike;
                strikes.push(part.strike);
            });
            setContracts(contracts);
            setStrikePrices(strikes);
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
        GaEvent('fetch contracts');
    };

    const expirationTimestampsOptions = [];
    expirationTimestamps.map((timestamp, index) => {
        // Yahoo's timestamp * 1000 = TD's timestamp.
        const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
            .toLocaleDateString('en-US');
        expirationTimestampsOptions.push({ value: timestamp, label: date });
    })

    const ExpandContractRow = {
        renderer: (row) => (
            <ContractDetailsCard contract={row} expandReadMore={true} />
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

    return (
        <Container id="content" className="min-vh-100" style={{ "marginTop": "2rem" }} fluid>
            <Helmet>
                <title>Tigerstance | Browse the options chain with ease and clarity.</title>
            </Helmet>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <h2 className="text-center">Browse option contracts</h2>
            <Row className="justify-content-md-center">
                <Col md={4}>
                    <Form>
                        <Form.Group>
                            <Form.Label className="requiredField"><h4>Enter ticker symbol:</h4></Form.Label>
                            <TickerTypeahead
                                selectedTicker={selectedTicker}
                                allTickers={allTickers}
                                onTickerSelectionChange={onTickerSelectionChange}
                            />
                        </Form.Group>
                    </Form>
                    {selectedTicker.length > 0 ?
                        <div>
                            <TickerSummary basicInfo={basicInfo} from={'option'} />
                        </div>
                        :
                        null
                    }
                    {selectedTicker.length > 0 ?
                        <div>
                            <br />
                            <div style={{ maxWidth: '30rem', height: '20rem' }}>
                                <TradingViewWidget
                                    symbol={basicInfo.symbol}
                                    autosize
                                />

                            </div>
                            <br />
                        </div>
                        :
                        null
                    }
                </Col>
                <Col md={7}>
                    {selectedTicker.length > 0 ?
                        <div>
                            <Form onSubmit={handleSubmit}>
                                <Form.Label className="requiredField"><h4>Expiration Dates:</h4></Form.Label>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group>
                                            <div>
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
                                            <div>
                                                {showTimestampAlert ?
                                                    <Alert variant="warning">
                                                        Please select at least one expiration date.
                                                    </Alert>
                                                    : null
                                                }
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Button type="submit" className="btn btn-primary">Get options</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        :
                        null
                    }
                    {contracts.length > 0 ?
                        <div>
                            <h4>Filters</h4>
                            <Row md={2}>
                                <Col sm="2" xs="12">
                                    <Form.Group>
                                        <Form.Label className="font-weight-bold">Call/Put:</Form.Label>
                                        <br />
                                        <ButtonToggleFilter
                                            choiceLabelMap={{ false: 'Put', true: 'Call' }}
                                            tableFilter={putCallFilter}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm="4" xs="12">
                                    <Form.Group style={{ paddingBottom: "1.5rem" }}>
                                        <Form.Label className="font-weight-bold">Strike price:</Form.Label>
                                        <StrikeRangeSliderFilter
                                            atmPrice={basicInfo.regularMarketPrice}
                                            strikePrices={strikePrices}
                                            minStrikeFilter={minStrikeFilter}
                                            maxStrikeFilter={maxStrikeFilter}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Form.Label className="font-weight-bold">Min volume:</Form.Label>
                                    <Form.Control name="volume" as="select" defaultValue={0}
                                        onChange={(e) => onVolumeFilterChange(e, minVolumeFilter)}>
                                        <option key="0" value="0">&#x2265; 0</option>
                                        {[10, 50, 100, 200, 500, 1000, 10000].map((v, index) => {
                                            return (
                                                <option key={v} value={v}>&#x2265; {v}</option>
                                            );
                                        })}
                                    </Form.Control>
                                </Col>
                                <Col sm="3" xs="6">
                                    <Form.Group>
                                        <Form.Label className="font-weight-bold">Min open interest:</Form.Label>
                                        <Form.Control name="open_interest" as="select" defaultValue={0}
                                            onChange={(e) => onOpenInterestFilterChange(e, minOpenInterestFilter)}>
                                            <option key="0" value="0">&#x2265; 0</option>
                                            {[10, 50, 100, 200, 500, 1000, 10000].map((v, index) => {
                                                return (
                                                    <option key={v} value={v}>&#x2265; {v}</option>
                                                );
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                {/* <Col>
                                    <Form>
                                        <Form.Group>
                                            <Form.Label className="font-weight-bold">Premium:</Form.Label>
                                            <SliderFilter
                                                min={0}
                                                max={200}
                                                // onChange={(e) => onPremiumFilterChange(e, premiumFilter)}
                                            />
                                        </Form.Group>
                                    </Form>
                                </Col> */}
                            </Row>
                            <br />
                            <Accordion>
                                <Card>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                        <span className="text-dark">Advanced Filters</span>
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey="0">
                                        <Card.Body>
                                            <Row className="justify-content-md-center" >
                                                <Col sm="3" xs="6">
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
                                                </Col>
                                                <Col sm="3" xs="6">
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
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                            <div>
                                <Row>
                                    <Col sm="9"></Col>
                                    <Col sm="3">
                                        {InTheMoneySign()}
                                    </Col>
                                </Row>
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
                                    expandRow={ExpandContractRow}
                                    rowStyle={InTheMoneyRowStyle}
                                    filter={filterFactory()}
                                    defaultSorted={defaultSorted}
                                />
                            </div>
                        </div>
                        :
                        null
                    }
                </Col>
            </Row>
        </Container >
    );
}