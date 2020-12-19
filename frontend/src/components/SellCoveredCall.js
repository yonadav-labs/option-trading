import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import TickerTypeahead from '../components/TickerTypeahead';
import TickerSummary from '../components/TickerSummary.js';
import Axios from 'axios';
import getApiUrl, {
    PriceFormatter, ExpDayFormatter, ExpandContractRow, InTheMoneyRowStyle,
    InTheMoneySign, onInTheMoneyFilterChange, onLastTradedFilterChange,
    ProfitFormatter, PriceMovementFormatter
} from '../utils';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { multiSelectFilter, numberFilter } from 'react-bootstrap-table2-filter';
import ModalSpinner from '../components/ModalSpinner';

let inTheMoneyFilter;
let lastTradedFilter;

export default function SellCoveredCall() {
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestCalls, setBestCalls] = useState([]);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);
    const [useAsPremium, setUseAsPremium] = useState('estimated');
    const [modalActive, setModalActive] = useState(false);

    const resetStates = () => {
        setSelectedTicker([]);
        setExpirationTimestamps([]);
        setbasicInfo({});
        setShowTimestampAlert(false);
        setBestCalls([]);
        setModalActive(false);
        setSelectedExpirationTimestamps([]);
    }

    const API_URL = getApiUrl();

    const selectOptions = {
        true: 'ITM',
        false: 'OTM'
    };
    const result_table_columns = [
        {
            dataField: "to_strike_ratio",
            text: "Strike price",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceMovementFormatter(cell, row.contract.strike)
            ),
            sort: true,
        }, {
            dataField: "estimated_premium",
            text: "Premium",
            formatter: PriceFormatter,
            sort: true
        }, {
            dataField: "premium_gain",
            text: "Premium Profit",
            formatter: (cell, row, rowIndex, extraData) => (
                ProfitFormatter(cell, row)
            ),
            sort: true
        }, {
            dataField: "gain_cap",
            text: "Profit Ceiling",
            formatter: (cell, row, rowIndex, extraData) => (
                ProfitFormatter(cell, row)
            ),
            sort: true
        }, {
            dataField: "contract.expiration",
            text: "Expiration",
            formatter: (cell, row, rowIndex, extraData) => (
                ExpDayFormatter(cell, row.contract.days_till_expiration)
            )
        }, {
            dataField: 'contract.in_the_money',
            text: 'In the money',
            // hidden: true, getFilter() won't be called if hidden is true.
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            formatter: cell => selectOptions[cell],
            filter: multiSelectFilter({
                options: selectOptions,
                getFilter: (filter) => {
                    inTheMoneyFilter = filter;
                }
            })
        }, {
            dataField: 'contract.last_trade_date',
            text: 'last_trade_date',
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    lastTradedFilter = filter;
                }
            })
        },
    ];
    const defaultSorted = [{
        dataField: "to_strike_ratio",
        order: "asc"
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
            getCoveredCalls(selectedExpirationTimestamps);
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

    const handleUseAsPremiumChange = (event) => {
        const target = event.target;
        var value = target.value;
        setUseAsPremium(value);
    };

    const getCoveredCalls = async (selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/sell_covered_calls/?`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp}&` });
            url += `use_as_premium=${useAsPremium}`
            setModalActive(true);
            const response = await Axios.get(url);
            setBestCalls(response.data.all_calls);
            setModalActive(false);
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    return (
        <div id="content" className="container" style={{ "marginTop": "4rem" }}>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <h1 className="text-center">Sell covered call</h1>
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
                        <h5>Configurations</h5>
                        <hr />
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
                                    <Button type="submit" className="btn btn-dark">Analyze</Button>
                                </div>
                            </div>
                        </Form>
                        <br />
                        {bestCalls.length > 0 ?
                            <div>
                                <h5>Results</h5>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3">
                                        <Form>
                                            <Form.Group>
                                                <Form.Label className="font-weight-bold">Filter by strike:</Form.Label>
                                                <Form.Control name="tradeoff" as="select" defaultValue={0}
                                                    onChange={(e) => onInTheMoneyFilterChange(e, inTheMoneyFilter)}>
                                                    <option key="all" value="all">All</option>
                                                    <option key="itm" value="itm">In the money</option>
                                                    <option key="otm" value="otm">Out of the money</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    </div>
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
                                    <div className="col-sm-4">
                                    </div>
                                    <div className="col-sm-2">
                                        {InTheMoneySign()}
                                    </div>
                                </div>


                                <BootstrapTable
                                    classes="table-responsive"
                                    bootstrap4={true}
                                    keyField="contract_symbol"
                                    data={bestCalls}
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