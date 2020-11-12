import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import TickerTypeahead from '../components/TickerTypeahead';
import TickerSummary from '../components/TickerSummary.js';
import Axios from 'axios';
import getApiUrl from '../utils';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import NumberFormat from 'react-number-format';



export default function SellCoveredCall() {
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});

    const API_URL = getApiUrl();
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestCalls, setBestCalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);

    const result_table_columns = [
        {
            dataField: 'contract_symbol',
            text: 'Contract Symbol',
        }, {
            dataField: "expiration_str",
            text: "Expiration",
        }, {
            dataField: "strike_str",
            text: "Strike",
        }, {
            dataField: "estimated_price_str",
            text: "Premium",
        }, {
            dataField: "strike_diff_ratio_str",
            text: "To strike",
        }, {
            dataField: "gain_cap_str",
            text: "Upside Cap",
        }, {
            dataField: "premium_gain_str",
            text: "Premium gain",
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
            let all_calls = response.data.all_calls;

            all_calls.forEach(function (row) {
                row.estimated_price_str = (<NumberFormat value={row.estimated_price} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} />)
                row.strike_str = (<NumberFormat value={row.strike} displayType={'text'} thousandSeparator={true} prefix={'$'} />)
                row.strike_diff_ratio_str = (<NumberFormat value={row.strike_diff_ratio * 100} displayType={'text'} decimalScale={2} suffix={'%'} />)
                row.gain_cap_str = (<span>
                    <NumberFormat value={row.gain_cap * 100} displayType={'text'} decimalScale={2} suffix={'%'} />
                    &nbsp;(<NumberFormat value={row.annualized_gain_cap * 100} displayType={'text'} decimalScale={2} suffix={'%'} /> annually)
                </span>)
                row.premium_gain_str = (<span>
                    <NumberFormat value={row.premium_gain * 100} displayType={'text'} decimalScale={2} suffix={'%'} />
                    &nbsp;(<NumberFormat value={row.annualized_premium_gain * 100} displayType={'text'} decimalScale={2} suffix={'%'} /> annually)
                </span>)
                const exp_date = new Date(row.expiration * 1000).toLocaleDateString('en-US', { 'timeZone': 'GMT' })
                row.expiration_str = (<div>{exp_date} ({row.days_till_expiration} days)</div>);
            });

            setBestCalls(all_calls);
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
                                            <div className="col-sm-6" key={index}>
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
                        <BootstrapTable
                            classes="table-responsive"
                            loading={loading}
                            bootstrap4={true}
                            keyField="contract_symbol"
                            data={bestCalls}
                            columns={result_table_columns}
                            pagination={paginationFactory()}
                            noDataIndication="No Data"
                            bordered={false}
                            overlay={overlayFactory({ spinner: true })} />
                    </div>
                </div>
                :
                null
            }
        </div>
    );
}