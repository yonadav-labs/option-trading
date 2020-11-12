import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import RangeSlider from 'react-bootstrap-range-slider';
import Axios from 'axios';
import getApiUrl from '../utils';
import NumberFormat from 'react-number-format';

export default function BestCallByPrice({ selectedTicker, expirationTimestamps }) {
    const API_URL = getApiUrl();
    const [showTimestampAlert, setShowTimestampAlert] = useState(false);
    const [bestCalls, setBestCalls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExpirationTimestamps, setSelectedExpirationTimestamps] = useState([]);
    const [tradeoffValue, setTradeoffValue] = React.useState(0.0);

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
            dataField: "break_even_price_str",
            text: "Breakeven Point",
        }, {
            dataField: "gain_str",
            text: "Option Gain",
        }, {
            dataField: "stock_gain_str",
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
            setLoading(true);
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

    const getBestCalls = async (targetPrice, selectedExpirationTimestamps) => {
        try {
            let url = `${API_URL}/tickers/${selectedTicker}/calls/?target_price=${targetPrice}&`;
            selectedExpirationTimestamps.map((timestamp) => { url += `expiration_timestamps=${timestamp}&` });
            url += `month_to_percent_gain=${tradeoffValue}`
            const response = await Axios.get(url);
            let all_calls = response.data.all_calls;
            all_calls.forEach(function (row) {
                row.strike_str = (<NumberFormat value={row.strike} displayType={'text'} thousandSeparator={true} prefix={'$'} />)
                row.estimated_price_str = (<NumberFormat value={row.estimated_price} displayType={'text'} thousandSeparator={true} prefix={'$'} />)
                row.break_even_price_str = (<NumberFormat value={row.break_even_price} displayType={'text'} thousandSeparator={true} prefix={'$'} />)
                row.gain_str = (<NumberFormat value={row.gain * 100} displayType={'text'} decimalScale={2} suffix={'%'} />)
                row.stock_gain_str = (<NumberFormat value={row.stock_gain * 100} displayType={'text'} decimalScale={2} suffix={'%'} />)
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
        <div>
            <h4>Best call options to buy with targeted price</h4>
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
    );
}