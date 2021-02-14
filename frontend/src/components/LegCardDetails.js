import React, { useEffect, useState } from 'react';
import getApiUrl, { PercentageFormatter, PriceFormatter } from '../utils';
import Axios from 'axios';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ContractDetailsCard from './cards/ContractDetailsCard';
import { Badge, Col, Form, Row } from 'react-bootstrap';
import { isEmpty } from 'lodash';
import Select from 'react-select';

export default function LegCardDetails(props) {
    const { legs, index, selectedTicker, updateLeg, selectedStrategy, expirationTimestamps } = props;
    const [strikes, setStrikes] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [selectedStrike, setSelectedStrike] = useState(0);
    const API_URL = getApiUrl();

    useEffect(async () => {
        const leg = legs[index];

        if (leg.type === "option" && leg.action && leg.optionType && leg.expiration) {
            // call api to get option chain
            try {
                let url = `${API_URL}/tickers/${selectedTicker[0].symbol}/contracts/?`;
                url += `expiration_timestamps=${leg.expiration}&`
                const response = await Axios.get(url);
                const filteredContracts = response.data.contracts.filter(contract => (leg.optionType === "call" && contract.is_call) || (leg.optionType === "put" && !contract.is_call));
                let strikes = filteredContracts.map(val => {
                    const percentageChange = ((props.atmPrice - val.strike) / props.atmPrice) * -1;

                    return { value: val.strike, label: <>{PriceFormatter(val.strike)} ({percentageChange > 0 ? "+" : ""}{PercentageFormatter(percentageChange)})</> };
                });

                strikes.push({ value: props.atmPrice, label: <>{PriceFormatter(props.atmPrice)} (Current Price)</>, isDisabled: true });
                setContracts(filteredContracts);
                setStrikes(strikes.sort((a, b) => a.value - b.value));
            } catch (error) {
                console.error(error);
            }
        }
    }, [props.legs]);

    const onStrikeSelectChange = (option) => {
        setSelectedStrike(option);
        updateLeg("contract", option ? contracts.filter((val) => val.strike === option.value)[0] : {}, index);
    }

    switch (legs[index].type) {
        case "option":
            return (
                <>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Row>
                                    <Col>
                                        <Badge variant="secondary">Position</Badge>
                                        <Form.Control as="select" value={legs[index].action} onChange={(e) => updateLeg("action", e.target.value, index)} disabled={selectedStrategy.legs[index].action}>
                                            <option value="long" key="long">Long</option>
                                            <option value="short" key="short">Short</option>
                                        </Form.Control>
                                    </Col>
                                    <Col>
                                        <Badge variant="secondary">Option Type</Badge>
                                        <Form.Control as="select" value={legs[index].optionType} onChange={(e) => updateLeg("optionType", e.target.value, index)} disabled={selectedStrategy.legs[index].optionType}>
                                            <option value="call" key="call">Call</option>
                                            <option value="put" key="put">Put</option>
                                        </Form.Control>
                                    </Col>
                                    <Col>
                                        <Badge variant="secondary">Expiration Date</Badge>
                                        <Form.Control as="select" value={legs[index].expiration || 0} onChange={(e) => updateLeg("expiration", e.target.value, index)} disabled={selectedStrategy.legs[index].expiration}>
                                            {expirationTimestamps.map(val => {
                                                return (<option value={val} key={val}>{new Date(val < 9999999999 ? val * 1000 : val).toLocaleDateString()}</option>);
                                            })}
                                            <option disabled value={0} key="blank">Select an expiration</option>
                                        </Form.Control>
                                    </Col>
                                </Form.Row>
                            </Form>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Badge variant="secondary">Strike</Badge>
                            <Select
                                className="basic-single"
                                isSearchable
                                isClearable
                                options={strikes}
                                placeholder="Select a strike..."
                                value={selectedStrike}
                                onChange={(val) => onStrikeSelectChange(val)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ContractDetailsCard contract={!isEmpty(legs[index].contract) ? legs[index].contract : null} />
                        </Col>
                    </Row>
                </>
            );
        case "stock":
            return (
                <>
                    <Row>
                        <Col>
                            <p>Hold {selectedTicker.length > 0 ? `${legs[index].shares} ${selectedTicker[0].symbol}` : ""} shares</p>
                        </Col>
                    </Row>
                </>
            );
        case "cash":
            return (
                <>
                    <Row>
                        <Col>
                            <p>Hold {PriceFormatter(legs[index].value)} in cash</p>
                        </Col>
                    </Row>
                </>
            );
        default:
            return null;
    }
}