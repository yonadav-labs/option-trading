import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import RangeSlider from 'react-bootstrap-range-slider';
import Axios from 'axios';
import getApiUrl, {
    PercentageFormatter, PriceFormatter, TimestampWithDaysFormatter, NumberRoundFormatter,
    ExpandContractRow, InTheMoneyRowStyle, InTheMoneySign, onInTheMoneyFilterChange, SmallTextFormatter,
    onLastTradedFilterChange
} from '../utils';
import filterFactory, { multiSelectFilter, numberFilter } from 'react-bootstrap-table2-filter';

let inTheMoneyFilter;
let lastTradedFilter;

export default function BestCallByPrice({ selectedTicker, expirationTimestamps, setModalActive }) {
    const API_URL = getApiUrl();
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestCalls, setBestCalls] = useState([]);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);
    const [tradeoffValue, setTradeoffValue] = React.useState(0.0);
    const [useAsPremium, setUseAsPremium] = useState('estimated');

    const selectOptions = {
        true: 'ITM',
        false: 'OTM'
    };
    const result_table_columns = [
        {
            dataField: "strike",
            text: "Strike",
            formatter: PriceFormatter,
            sort: true
        }, {
            dataField: "estimated_premium",
            text: "Premium",
            formatter: PriceFormatter,
            sort: true
        }, {
            dataField: "break_even_price",
            text: "Breakeven Point",
            formatter: PriceFormatter,
            sort: true
        }, {
            dataField: "gain",
            text: "Option Gain",
            formatter: PercentageFormatter,
            sort: true
        }, {
            dataField: "stock_gain",
            text: "Stock Gain",
            formatter: PercentageFormatter
        }, {
            dataField: 'in_the_money',
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
            dataField: 'last_trade_date',
            text: 'last_trade_date',
            style: { 'display': 'none' },
            headerStyle: { 'display': 'none' },
            filter: numberFilter({
                getFilter: (filter) => {
                    lastTradedFilter = filter;
                }
            })
        },
        {
            dataField: "expiration",
            text: "Expiration",
            formatter: (cell, row, rowIndex, extraData) => (
                TimestampWithDaysFormatter(cell, row.days_till_expiration)
            )
        },
        {
            dataField: 'contract_symbol',
            text: 'Contract Symbol',
            formatter: SmallTextFormatter
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
            getBestCalls(formDataObj.target_price, selectedExpirationTimestamps);
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

    const getBestCalls = async (targetPrice, selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker}/calls/?target_price=${targetPrice}&`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp}&` });
            url += `month_to_percent_gain=${tradeoffValue}`
            url += `&use_as_premium=${useAsPremium}`
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
        <div>
            <h5>Configurations</h5>
            <hr />
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label className="font-weight-bold">Target price (USD):</Form.Label>
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
                    <Form.Label className="font-weight-bold">Expiration Dates:</Form.Label>
                    <div className="row">
                        {expirationTimestamps.map((timestamp, index) => {
                            // Yahoo's contract expiration timestamp uses GMT.
                            const date = new Date(timestamp * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' });
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
                <div className="font-weight-bold">Month to gain tradeoff: </div>
                <div>Reduce {(tradeoffValue * 100.0).toFixed(2)}% gain for 30 days additional expiration time.</div>
                <div>
                    <RangeSlider
                        value={tradeoffValue}
                        onChange={e => setTradeoffValue(e.target.value)}
                        tooltipLabel={currentValue => `${(currentValue * 100.0).toFixed(2)}%`}
                        step={0.0025}
                        min={0.0}
                        max={0.1}
                        tooltip='auto'
                        size='sm'
                    />
                </div>
                <div class="row">
                    <div className="col">
                        <Button type="submit" className="btn btn-primary">Analyze</Button>
                    </div>
                </div>
            </Form>
            <br />
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
                    sizePerPage: 25,
                    hidePageListOnlyOnePage: true
                })}
                noDataIndication="No Data"
                bordered={false}
                expandRow={ExpandContractRow()}
                rowStyle={InTheMoneyRowStyle}
                filter={filterFactory()}
            />
        </div >
    );
}