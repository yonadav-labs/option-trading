import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import TickerTypeahead from '../components/TickerTypeahead';
import TickerSummary from '../components/TickerSummary.js';
import Axios from 'axios';
import getApiUrl, {
    PriceFormatter, PercentageWithAnnualizedFormatter, TimestampFormatter,
    ExpandContractRow, InTheMoneyRowStyle, InTheMoneySign, onInTheMoneyFilterChange,
    PriceWithPercentageFormatter
} from '../utils';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { multiSelectFilter } from 'react-bootstrap-table2-filter';

let inTheMoneyFilter;

export default function SellCoveredCall() {
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestCalls, setBestCalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);

    const resetStates = () => {
        setSelectedTicker([]);
        setExpirationTimestamps([]);
        setbasicInfo({});
        setShowTimestampAlert(false);
        setBestCalls([]);
        setLoading(false);
        setSelectedExpirationTimestamps([]);
    }

    const API_URL = getApiUrl();

    const selectOptions = {
        true: 'ITM',
        false: 'OTM'
    };
    const result_table_columns = [
        {
            dataField: "strike",
            text: "Strike",
            formatter: PriceFormatter
        }, {
            dataField: "estimated_premium",
            text: "Premium",
            formatter: PriceFormatter
        }, {
            dataField: "to_strike",
            text: "To strike",
            formatter: (cell, row, rowIndex, extraData) => (
                PriceWithPercentageFormatter(cell, row.to_strike_ratio)
            )
        }, {
            dataField: "gain_cap",
            text: "Max gain",
            formatter: (cell, row, rowIndex, extraData) => (
                PercentageWithAnnualizedFormatter(cell, row.annualized_gain_cap)
            )
        }, {
            dataField: "premium_gain",
            text: "Premium gain",
            formatter: (cell, row, rowIndex, extraData) => (
                PercentageWithAnnualizedFormatter(cell, row.annualized_premium_gain)
            )
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
            dataField: "expiration",
            text: "Expiration",
            formatter: TimestampFormatter
        }, {
            dataField: 'contract_symbol',
            text: 'Contract Symbol',
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
            setLoading(true);
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

    const getCoveredCalls = async (selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/sell_covered_calls/?`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp}&` });
            const response = await Axios.get(url);
            let allCalls = response.data.all_calls;
            let strikeSet = new Set()
            for (const row of allCalls) {
                // Requires calls to be sorted by strike.
                strikeSet.add(row.strike);
                row.unique_strike_count = strikeSet.size;
            }
            setBestCalls(allCalls);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div id="content">
            <h1 className="text-center">Sell covered call</h1>
            <Form>
                <Form.Group>
                    <Form.Label className="requiredField"><h5>Enter ticker symbol:</h5></Form.Label>
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        resetStates={resetStates}
                    />
                </Form.Group>
            </Form>
            {selectedTicker.length > 0 ?
                <div>
                    <TickerSummary basicInfo={basicInfo} />
                    <div>
                        <h4>Best call options to buy with targeted price</h4>
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
                            <br />
                            <Button type="submit">Analyze</Button>
                        </Form>
                        <br />
                        {InTheMoneySign()}

                        <div className="row">
                            <Form>
                                <Form.Group>
                                    <Form.Label className="font-weight-bold">Filter by strike price:</Form.Label>
                                    <Form.Control name="tradeoff" as="select" defaultValue={0}
                                        onChange={(e) => onInTheMoneyFilterChange(e, inTheMoneyFilter)}>
                                        <option key="all" value="all">All</option>
                                        <option key="itm" value="itm">In the money</option>
                                        <option key="otm" value="otm">Out of the money</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                        </div>

                        <BootstrapTable
                            classes="table-responsive"
                            loading={loading}
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
                            // overlay={overlayFactory({ spinner: true })} // does not work with filter.
                            expandRow={ExpandContractRow()}
                            rowStyle={InTheMoneyRowStyle}
                            filter={filterFactory()}
                        />
                    </div>
                </div>
                :
                null
            }
        </div>
    );
}