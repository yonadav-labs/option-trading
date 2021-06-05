import React, { useEffect, useState } from 'react';
import getApiUrl, { PercentageFormatter, PriceFormatter, GetGaEventTrackingFunc } from '../utils';
import Axios from 'axios';
import ContractDetailsCard from './cards/ContractDetailsCard';
import { Col, Form, Row } from 'react-bootstrap';
import { isEmpty } from 'lodash';
import Select from 'react-select';
import MetricLabel from './MetricLabel.js';

const GaEvent = GetGaEventTrackingFunc('options builder');

export default function CustomizableLegCard(props) {
    const { leg, index, selectedTicker, updateLeg, selectedStrategy, expirationTimestamps } = props;
    const [strikes, setStrikes] = useState([]);
    const [selectedStrike, setSelectedStrike] = useState(0);
    const API_URL = getApiUrl();

    useEffect(async () => {
        setStrikes([]);
        setSelectedStrike('')

        if (leg.type === "option" && leg.action && leg.optionType && leg.expiration) {
            // call api to get option chain
            try {
                let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/contracts/`;
                let body = {
                    expiration_timestamps: [leg.expiration],
                    filters: {}
                };
                const response = await Axios.post(url, body);
                const filteredContracts = response.data.contracts.filter(contract => (leg.optionType === "call" && contract.is_call) || (leg.optionType === "put" && !contract.is_call));
                let selectedStrikeIsValid = false;
                let strikes = filteredContracts.map(val => {
                    const percentageChange = ((props.atmPrice - val.strike) / props.atmPrice) * -1;
                    const option = { value: val.strike, label: <>{PriceFormatter(val.strike)} ({percentageChange > 0 ? "+" : ""}{PercentageFormatter(percentageChange)})</> };

                    if (leg.strike === '') {
                        setSelectedStrike('')
                    } else if (val.strike === leg.strike) {
                        selectedStrikeIsValid = true;
                        setSelectedStrike(option);
                    }
                    return option;
                });

                strikes.push({ value: props.atmPrice, label: <>{PriceFormatter(props.atmPrice)} (Current Price)</>, isDisabled: true });
                setStrikes(strikes.sort((a, b) => a.value - b.value));
                updateLeg("contract", selectedStrikeIsValid ? filteredContracts.filter((val) => val.strike === leg.strike)[0] : {}, index);
            } catch (error) {
                console.error(error);
            }
        }
    }, [leg.expiration, leg.action, leg.optionType, leg.strike, selectedStrategy]);

    const onStrikeSelectChange = (option) => {
        setSelectedStrike(option);
        updateLeg("strike", option ? option.value : '', index);
    }

    const onExpirationChange = (event) => {
        updateLeg("expiration", event.target.value, index);
    }

    switch (leg.type) {
        case "option":
            return (
                <>
                    <Row className="mb-3">
                        <Col>
                            <Form>
                                <Form.Row>
                                    <Col sm="2" xs="12">
                                        <MetricLabel label="leg" />
                                        <Form.Control as="select" disabled={true}>
                                            <option>#{index + 1}</option>
                                        </Form.Control>
                                    </Col>
                                    <Col sm="2" xs="12">
                                        <MetricLabel label="action" />
                                        <Form.Control as="select" value={leg.action} onChange={(e) => updateLeg("action", e.target.value, index)} disabled={selectedStrategy.legs[index].action}>
                                            <option value="long" key="long">Long</option>
                                            <option value="short" key="short">Short</option>
                                        </Form.Control>
                                    </Col>
                                    <Col sm="2" xs="12">
                                        <MetricLabel label="call/put" />
                                        <Form.Control as="select" value={leg.optionType} onChange={(e) => updateLeg("optionType", e.target.value, index)} disabled={selectedStrategy.legs[index].optionType}>
                                            <option value="call" key="call">Call</option>
                                            <option value="put" key="put">Put</option>
                                            <option hidden value="">Select an option type</option>
                                        </Form.Control>
                                    </Col>
                                    <Col sm="3" xs="12">
                                        <MetricLabel label="expiration date" />
                                        <Form.Control as="select" value={leg.expiration || 0}
                                            onChange={(e) => { GaEvent('adjust leg exp date'); onExpirationChange(e); }}
                                            disabled={selectedStrategy.legs[index].expiration}>
                                            {expirationTimestamps.map(val => {
                                                return (<option value={val} key={val}>{new Date(val < 9999999999 ? val * 1000 : val).toLocaleDateString()}</option>);
                                            })}
                                            <option hidden value={0} key="blank">Select an expiration</option>
                                        </Form.Control>
                                    </Col>
                                    <Col sm="3" xs="12">
                                        <MetricLabel label="strike" hideIcon />
                                        <Select
                                            className="basic-single"
                                            isSearchable
                                            isClearable
                                            options={strikes}
                                            placeholder="Select a strike..."
                                            value={selectedStrike}
                                            onChange={(val) => { GaEvent('adjust leg strike'); onStrikeSelectChange(val); }}
                                        />
                                    </Col>
                                </Form.Row>
                            </Form>
                        </Col >
                    </Row >
                    <Row>
                        <Col>
                            <ContractDetailsCard contract={!isEmpty(leg.contract) ? leg.contract : null} hideTitle={true} />
                        </Col>
                    </Row>
                </>
            );
        case "stock":
            return (
                <Row className="mb-3">
                    <Col>
                        <Form>
                            <Form.Row>
                                <Col sm="2" xs="12">
                                    <MetricLabel label="leg" />
                                    <Form.Control as="select" disabled={true}>
                                        <option>#{index + 1}</option>
                                    </Form.Control>
                                </Col>
                                <Col sm="2" xs="12">
                                    <MetricLabel label="action" />
                                    <Form.Control as="select" value={leg.action} disabled={true}>
                                        <option value="long" key="long">Long</option>
                                        <option value="short" key="short">Short</option>
                                    </Form.Control>
                                </Col>
                                <Col sm="2" xs="12">
                                    <MetricLabel label="shares" />
                                    <Form.Control as="select" value={leg.optionType} disabled={true}>
                                        <option value="100" key="100">100</option>
                                    </Form.Control>
                                </Col>
                            </Form.Row>
                        </Form>
                    </Col>
                </Row>
            );
        case "cash":
            return (
                <Row className="mb-3">
                    <Col>
                        <Form>
                            <Form.Row>
                                <Col sm="2" xs="12">
                                    <MetricLabel label="leg" />
                                    <Form.Control as="select" disabled={true}>
                                        <option>#{index + 1}</option>
                                    </Form.Control>
                                </Col>
                                <Col sm="3" xs="12">
                                    <MetricLabel label="action" />
                                    <Form.Control as="select" value={leg.action} disabled={true}>
                                        <option value="long" key="long">Keep as collateral</option>
                                    </Form.Control>
                                </Col>
                                <Col sm="2" xs="12">
                                    <MetricLabel label="Cash" />
                                    <Form.Control as="select" value={leg.optionType} disabled={true}>
                                        <option>{leg.value > 0 ? '$' + leg.value : 'TBD'}</option>
                                    </Form.Control>
                                </Col>
                            </Form.Row>
                        </Form>
                    </Col>
                </Row>
            );
        default:
            return null;
    }
}