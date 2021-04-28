import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from "react-helmet";
import TickerTypeahead from '../components/TickerTypeahead';
import { useOktaAuth } from '@okta/okta-react';
import getApiUrl, { loadTickers, GetGaEventTrackingFunc } from '../utils';
import ModalSpinner from '../components/ModalSpinner';
import HeatMapGraph from '../components/HeatMapGraph';
import Select from "react-select";
import Axios from 'axios';

import { Form, Container, Row, Col } from 'react-bootstrap';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from '../components/querying'

const GaEvent = GetGaEventTrackingFunc('surface');

export default function Surface() {
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [headers, setHeaders] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();

    // heatmap
    const [heatmapData, setHeatmapData] = useState(null);
    const [baseHeatmapData, setBaseHeatmapData] = useState(null);
    const [selectedContractType, setSelectedContractType] = useState('call');
    const [selectedTarget, setSelectedTarget] = useState('Implied Volatility');
    const [chartWidth, setChartWidth] = useState(0);
    const chartContainer = useRef(null);

    const resetStates = () => {
        setSelectedTicker([]);
    }

    const contractTypeOptions = [
        { value: 'call', label: 'Call' },
        { value: 'put', label: 'Put' }
    ]

    const targetOptions = [
        { value: 'Implied Volatility', label: 'Implied Volatility' },
        { value: 'Open Interest', label: 'Open Interest' },
        { value: 'Volume', label: 'Volume' }
    ]

    const loadHeatmapData = (symbol, params) => {
        try {
            setModalActive(true);
            setHeatmapData(null);
            setBaseHeatmapData(null);

            Axios.get(`${getApiUrl()}/tickers/${symbol}/heatmap_data/`, { params })
                .then(response => {
                    setBaseHeatmapData(response.data);
                    setModalActive(false);
                })
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const onTickerSelectionChange = (selected) => {
        GaEvent('ajust ticker');

        if (selected.length > 0) {
            setSelectedTicker(selected);
            addQuery(location, history, 'symbol', selected[0].symbol)
        } else {
            if (resetStates) {
                resetStates();
            }
        }
    };

    const onChangeContractType = (option) => {
        GaEvent('adjust contract type');
        setSelectedContractType(option.value);
    }

    const onChangeTarget = (option) => {
        GaEvent('adjust metric');
        setSelectedTarget(option.value);
    }

    useEffect(() => {
        if (selectedTicker.length > 0) {
            let params = { contract_type: selectedContractType }
            loadHeatmapData(selectedTicker[0].symbol, params);
        }
    }, [selectedTicker, selectedContractType])

    useEffect(() => {
        if (baseHeatmapData) {
            let data = baseHeatmapData.data.map(x => ([
                x[0], x[1], x[2][selectedTarget]
            ]));
            setHeatmapData({data, expirationDates: baseHeatmapData.expiration_dates, strikePrices: baseHeatmapData.strike_prices});
        }
    }, [baseHeatmapData, selectedTarget]);

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

    useEffect(() => {
        if (chartContainer.current) {
            setChartWidth(chartContainer.current.offsetWidth);
        }
    }, [chartContainer.current]);

    return (
        <Container id="content" style={{ "marginTop": "2rem" }} fluid>
            <Helmet>
                <title>Tigerstance | Implied Volatility Surface and more</title>
                <meta name="description"
                    content="Spot unusual options activities from bird's-eye view of the entire options chain. Gauge the market using Implied Volatility, Open Interest and Volume." />
            </Helmet>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <h2 className="text-center mb-2">Options chain surface</h2>
            <p className="text-center mb-4">
                Spot unusual options activities from bird's-eye view of the entire options chain. Gauge the market using Implied Volatility, Open Interest and Volume.<br />
                *Data could take some time to load, please wait patiently.
            </p>
            <Row className="justify-content-md-center">
                <Col md={10}>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="requiredField"><h4>Enter ticker symbol:</h4></Form.Label>
                                    <TickerTypeahead
                                        selectedTicker={selectedTicker}
                                        allTickers={allTickers}
                                        onTickerSelectionChange={onTickerSelectionChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="requiredField"><h4>Type:</h4></Form.Label>
                                    <Select
                                        className="basic-single"
                                        options={contractTypeOptions}
                                        onChange={(option) => onChangeContractType(option)}
                                        defaultValue={{ value: 'call', label: 'Call' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="requiredField"><h4>Metric:</h4></Form.Label>
                                    <Select
                                        className="basic-single"
                                        options={targetOptions}
                                        onChange={(option) => onChangeTarget(option)}
                                        defaultValue={{ value: 'Implied Volatility', label: 'Implied Volatility' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row className="justify-content-md-center min-vh-100">
                <Col md={10} ref={chartContainer}>
                    {heatmapData &&
                        <HeatMapGraph
                            className="my-4"
                            zLabel={selectedTarget}
                            data={heatmapData.data}
                            expirationDates={heatmapData.expirationDates}
                            strikePrices={heatmapData.strikePrices}
                            chartWidth={chartWidth}
                        />
                    }
                </Col>
            </Row>
        </Container >
    );
}