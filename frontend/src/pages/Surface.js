import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import TickerTypeahead from '../components/TickerTypeahead';
import { useOktaAuth } from '@okta/okta-react';
import getApiUrl, { loadTickers, loadExpirationDates } from '../utils';
import ModalSpinner from '../components/ModalSpinner';
import HeatMapGraph from '../components/HeatMapGraph';
import Select from "react-select";
import Axios from 'axios';

import { Form, Container, Row, Col } from 'react-bootstrap';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from '../components/querying'

export default function Surface() {
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [modalActive, setModalActive] = useState(false);
    const [headers, setHeaders] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();

    // heatmap
    const [heatmapData, setHeatmapData] = useState(null);
    const [selectedContractType, setSelectedContractType] = useState({ value: 'call', label: 'Call' });
    const [selectedTarget, setSelectedTarget] = useState({ value: 'implied_volatility', label: 'Implied Volatility' });

    const resetStates = () => {
        setSelectedTicker([]);
        setbasicInfo({});
        setHeatmapData(null);
    }

    const contractTypeOptions = [
        { value: 'call', label: 'Call' },
        { value: 'put', label: 'Put' }
    ]

    const targetOptions = [
        { value: 'implied_volatility', label: 'Implied Volatility' },
        { value: 'open_interest', label: 'Open Interest' },
        { value: 'volume', label: 'Volume' }
    ]

    const loadHeatmapData = (headers, symbol, params) => {
        try {
            setModalActive(true);
            Axios.get(`${getApiUrl()}/tickers/${symbol}/heatmap_data/`, { headers, params })
                .then(response => {
                    setHeatmapData(response.data);
                    setModalActive(false);
                })
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const onTickerSelectionChange = (selected) => {
        if (selected.length > 0) {
            loadExpirationDates(headers, selected, () => { }, () => { }, setbasicInfo, setSelectedTicker);
            addQuery(location, history, 'symbol', selected[0].symbol)
        }
        if (resetStates) {
            resetStates([]);
        }
    };

    const onChangeContractType = (option) => {
        setSelectedContractType(option);
    }

    const onChangeTarget = (option) => {
        setSelectedTarget(option);
    }

    useEffect(() => {
        if (selectedTicker.length > 0) {
            setHeatmapData(null);
            let params = { contract_type: selectedContractType.value, target: selectedTarget.value }
            loadHeatmapData(headers, selectedTicker[0].symbol, params);
        }
    }, [selectedTicker, selectedContractType, selectedTarget])

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
                                        defaultValue={selectedContractType}
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
                                        defaultValue={selectedTarget}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row className="justify-content-md-center min-vh-100">
                <Col md={10}>
                    {selectedTicker.length > 0 && heatmapData &&
                        <HeatMapGraph
                            className="my-4"
                            zLabel={selectedTarget.label}
                            data={heatmapData.data}
                            expirationDates={heatmapData.expiration_dates}
                            strikePrices={heatmapData.strike_prices}
                        />
                    }
                </Col>
            </Row>
        </Container >
    );
}