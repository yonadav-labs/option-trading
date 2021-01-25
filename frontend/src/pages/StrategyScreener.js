import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Axios from 'axios';
import Select from "react-select";

import getApiUrl, {
    PriceFormatter, TimestampDateFormatter, onLastTradedFilterChange,
    PriceMovementFormatter, getTradeStrikeStr, getTradeTypeDisplay, getAllTradeTypes
} from '../utils';
import filterFactory, { multiSelectFilter, numberFilter } from 'react-bootstrap-table2-filter';
import { BsArrowsExpand, BsArrowsCollapse } from 'react-icons/bs';
import TickerTypeahead from '../components/TickerTypeahead';
import TickerSummary from '../components/TickerSummary.js';
import ModalSpinner from '../components/ModalSpinner';
import { useSearch } from "../components/querying"
import TradeDetailsCard from '../components/cards/TradeDetailsCard';
import TargetPriceRangeSlider from '../components/TargetPriceRangeSlider';


let lastTradedFilter;
let strategyFilter;

export default function BestCallByPrice() {
    let location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    const API_URL = getApiUrl();
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [showTargetPriceAlert, setShowTargetPriceAlert] = useState(false);
    const [bestStrategies, setBestStrategies] = useState(null);
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState(null);
    const [useAsPremium, setUseAsPremium] = useState('estimated');
    const [modalActive, setModalActive] = useState(false);
    const [targetPriceLower, setTargetPriceLower] = useState(null);
    const [targetPriceUpper, setTargetPriceUpper] = useState(null);

    const resetStates = () => {
        setSelectedTicker([]);
        setExpirationTimestamps([]);
        setbasicInfo({});
        setShowTimestampAlert(false);
        setShowTargetPriceAlert(false);
        setBestStrategies(null);
        setSelectedExpirationTimestamp(null);
        setUseAsPremium('estimated');
        setModalActive(false);
        setTargetPriceLower(null);
        setTargetPriceUpper(null);
    }

    const setStockInfo = (basicInfo) => {
        setbasicInfo(basicInfo);
        setTargetPriceLower(null);
        setTargetPriceUpper(null);
    }

    const result_table_columns = [
        {
            dataField: "type",
            text: "Strategy",
            formatter: (cell, row, rowIndex, extraData) => {
                return (
                    <span>
                        {getTradeTypeDisplay(cell)}<br />
                        <small>{getTradeStrikeStr(row)}</small>
                    </span>
                );
            },
            sort: true
        }, {
            dataField: "to_break_even_ratio",
            text: "Break-even",
            formatter: (cell, row, rowIndex, extraData) => (
                <span>
                    At {PriceMovementFormatter(cell, row.break_even_price)}
                </span>
            ),
            sort: true
        }, {
            dataField: "cost",
            text: "Cost",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceFormatter(cell)
            ),
            sort: true
        }, {
            dataField: "profit_cap_ratio",
            text: "Profit limit",
            formatter: (cell, row, rowIndex, extraData) => (
                cell != null ?
                    (<span>{PriceMovementFormatter(cell, row.profit_cap)}</span>) : (<span>Unlimited</span>)
            ),
            sort: true
        }, {
            dataField: "target_price_profit_ratio",
            text: "Hypothetical return",
            hidden: targetPriceLower == null,
            formatter: (cell, row, rowIndex, extraData) => {
                if (cell != null) {
                    return (<span>{PriceMovementFormatter(cell, row.target_price_profit)}</span>);
                } else {
                    return (<span></span>);
                }
            },
            sort: true
        }, {
            dataField: 'min_last_trade_date',
            text: 'Last traded',
            formatter: (cell, row, rowIndex, extraData) => {
                if (cell == 0) return (<span>N/A</span>);
                const exp_date = new Date(cell * 1000).toLocaleDateString('en-US')
                const exp_time = new Date(cell * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                return (<span>{exp_date} <br /><small>{exp_time}</small></span>);
            },
            sort: true
        },
        // Below fields are hidden and used for filtering only.
        {
            dataField: 'min_last_trade_date2',
            text: 'min_last_trade_date2',
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
                options: getAllTradeTypes(),
                defaultValue: getAllTradeTypes(),
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
            strategyFilter(getAllTradeTypes());
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

        if (selectedExpirationTimestamp == null) {
            setShowTimestampAlert(true);
            return;
        } else {
            setShowTimestampAlert(false);
        }

        if (targetPriceLower == null || targetPriceUpper == null) {
            setShowTargetPriceAlert(true);
            return;
        } else {
            setShowTargetPriceAlert(false);
        }

        if (form.checkValidity() !== false && selectedExpirationTimestamp != null) {
            getBestStrategies(selectedExpirationTimestamp, formDataObj.available_cash);
        }
    };

    const handleUseAsPremiumChange = (event) => {
        const target = event.target;
        var value = target.value;
        setUseAsPremium(value);
    };

    const getBestStrategies = async (selectedExpirationTimestamp, availableCash) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/trades/?`;
            url += `expiration_timestamps=${selectedExpirationTimestamp.value}&`;
            url += `target_price_lower=${targetPriceLower}&target_price_upper=${targetPriceUpper}&`;
            if (availableCash) {
                url += `available_cash=${availableCash}&`;
            }
            setModalActive(true);
            const response = await Axios.get(url);
            let trades = response.data.trades;
            trades.map((val, index) => {
                val.type2 = val.type;
                val.min_last_trade_date2 = val.min_last_trade_date;
                val.id = index;
                return val;
            })
            setBestStrategies(trades);
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const ExpandTradeRow = {
        renderer: (row) => (
            <TradeDetailsCard trade={row} hideDisclaimer={true} />
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

    const expirationTimestampsOptions = [];
    expirationTimestamps.map((timestamp, index) => {
        // Yahoo's timestamp * 1000 = TD's timestamp.
        const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
            .toLocaleDateString('en-US');
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
                        querySymbol={querySymbol}
                        selectedTicker={selectedTicker}
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setStockInfo}
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
                                <h4>Select an option expiration date:</h4>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Select
                                            defaultValue={selectedExpirationTimestamp}
                                            isClearable
                                            onChange={setSelectedExpirationTimestamp}
                                            options={expirationTimestampsOptions}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            placeholder="Select an options expiration date."
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
                            <Form.Group>
                                <h4>Enter my target price range of {selectedTicker[0].symbol} share on {selectedExpirationTimestamp ?
                                    TimestampDateFormatter(selectedExpirationTimestamp.value / 1000) : "expiration day"}
                                    : {targetPriceLower != null ? <span>{PriceFormatter(targetPriceLower)} - {PriceFormatter(targetPriceUpper)}</span> : null}
                                </h4>
                            </Form.Group>
                            <div style={{ marginLeft: '2.5rem', marginRight: '2.5rem', marginBottom: '3.5rem' }}>
                                <TargetPriceRangeSlider
                                    currentPrice={basicInfo.regularMarketPrice}
                                    setPriceLower={setTargetPriceLower}
                                    setPriceUpper={setTargetPriceUpper} />
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    {showTargetPriceAlert ?
                                        <Alert variant="warning">
                                            Please select a target price range.
                                            </Alert>
                                        : null
                                    }
                                </div>
                            </div>
                            <h4>Optional settings:</h4>
                            <Form.Group>
                                <Form.Label>Cash to invest in {selectedTicker[0].symbol}:</Form.Label>
                                <Form.Control name="available_cash" as="input" type="number"
                                    placeholder="Enter the amount of cash you plan to invest in this trade." min="0.0" max="100000000.0" step="0.01" />
                            </Form.Group>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Form.Group>
                                        <Form.Label>Premium price options:</Form.Label>
                                        <Form.Control name="use_as_premium" as="select" defaultValue="estimated"
                                            onChange={handleUseAsPremiumChange}>
                                            <option key="estimated" value="estimated">Use estimated mid price</option>
                                            <option key="bid" value="bid">Use bid (buyer's) price</option>
                                            <option key="ask" value="ask">Use ask (seller's) price</option>
                                        </Form.Control>
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <Button type="submit" className="btn btn-primary">Analyze</Button>
                                </div>
                            </div>
                        </Form>
                        <br />
                        {bestStrategies != null ?
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
                                                    {getAllTradeTypes().map((type, index) => {
                                                        return (
                                                            <option key={type} value={type}>{getTradeTypeDisplay(type)}</option>
                                                        );
                                                    })}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                    <div className="col-sm-4">
                                    </div>
                                </div>
                                <p>
                                    *All results are based on estimated options value on expiration date.<br />
                                    *Hypothetical return: average of possible return outcomes under the assumption that {selectedTicker[0].symbol} share price will be within the target price range.
                                </p>
                                <div className="row">
                                    <div className="col">
                                        <BootstrapTable
                                            classes="table-responsive"
                                            bootstrap4={true}
                                            keyField="id"
                                            data={bestStrategies}
                                            columns={result_table_columns}
                                            pagination={paginationFactory({
                                                sizePerPage: 20,
                                                hidePageListOnlyOnePage: true
                                            })}
                                            noDataIndication="No eligible strategy found."
                                            bordered={false}
                                            expandRow={ExpandTradeRow}
                                            filter={filterFactory()}
                                            defaultSorted={defaultSorted}
                                            rowStyle={{ "cursor": "pointer" }}
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