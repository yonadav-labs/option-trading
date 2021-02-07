import React, { useState, useCallback } from 'react';
import { Alert, Button, Card, CardColumns, Col, Container, Form, Row, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { MdTrendingFlat, MdArrowUpward, MdArrowDownward, MdShowChart } from 'react-icons/md';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './StrategyComposer.css';
import { strategies } from '../blobs/Strategies';
import { cloneDeep, get, isEmpty, throttle } from 'lodash';
import TickerTypeahead from '../components/TickerTypeahead';
import ModalSpinner from '../components/ModalSpinner';
import TickerSummary from '../components/TickerSummary';
import Select from "react-select";
import getApiUrl from '../utils';
import Axios from 'axios';
import LegCardDetails from '../components/LegCardDetails';
import { useOktaAuth } from '@okta/okta-react/src/OktaContext';
import TradeDetailsCard from '../components/cards/TradeDetailsCard';
import TradingViewWidget from 'react-tradingview-widget';

// export function useHorizontalScroll() {
//     const elRef = useRef();
//     useEffect(() => {
//         const el = elRef.current;
//         if (el) {
//             const onWheel = e => {
//                 e.preventDefault();
//                 el.scrollTo({
//                     left: el.scrollLeft + e.deltaY * 2,
//                     behavior: "smooth"
//                 });
//             };
//             el.addEventListener("wheel", onWheel);
//             return () => el.removeEventListener("wheel", onWheel);
//         }
//     }, []);
//     return elRef;
// }

export default function StrategyComposer() {
    const [inputText, setInputText] = useState("");
    const [selectedTicker, setSelectedTicker] = useState("");
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [legs, setLegs] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const throttledSetInputText = useCallback(throttle(setInputText, 600), []);
    const [modalActive, setModalActive] = useState(false);
    const [sentiment, setSentiment] = useState("all");
    const [strategyDetails, setStrategyDetails] = useState(null);
    const [ruleMessage, setRuleMessage] = useState("");
    const [loadingStrategyDetails, setLoadingStrategyDetails] = useState(false);
    const API_URL = getApiUrl();
    const { authState } = useOktaAuth();
    const operators = {
        "<": (a, b, property) => { return get(a, property) < get(b, property) },
        "<=": (a, b, property) => { return get(a, property) <= get(b, property) },
        ">": (a, b, property) => { return get(a, property) > get(b, property) },
        ">=": (a, b, property) => { return get(a, property) >= get(b, property) }
    }

    const applyStrategy = (strategy) => {
        // enforce rules on change
        setStrategyDetails(null);
        setSelectedStrategy(strategy);
        if (strategy) {
            setLegs(cloneDeep(strategy.legs));
        }
    }

    const updateLeg = (key, value, index) => {
        // if (legs[index][key]) {
        //     setRuleMessage(enforceRules(selectedStrategy.rules, legs));
        // }
        // check if key is a linkedProperty
        if (selectedStrategy && selectedStrategy.linkedProperties.includes(key)) {
            // set value for all legs
            setLegs(prevState => {
                const newState = prevState.map(val => { val[key] = value; return val });
                if (prevState[index][key]) {
                    console.log(prevState[index][key]);
                    enforceRules(selectedStrategy.rules, newState);
                }
                return newState;
            });
        } else {
            setLegs(prevState => {
                const newState = [...prevState.slice(0, index), { ...prevState[index], [key]: value }, ...prevState.slice(index + 1)];
                if (prevState[index][key]) {
                    enforceRules(selectedStrategy.rules, newState);
                }
                return newState;
            });
        }
    }

    const enforceRules = (rules, legs) => {
        let message = "";
        const finalResult = rules.reduce((prev, curr) => {
            const legAIndex = curr.legAIndex;
            const legBIndex = curr.legBIndex;
            const property = curr.legProperty;
            const operator = curr.operator;
            const ruleResult = operators[operator](legs[legAIndex], legs[legBIndex], property);
            if (!ruleResult) {
                message += `Leg ${legAIndex + 1}'s ${property.replace(".", " ")} needs to be ${operator} Leg ${legBIndex + 1}'s ${property.replace(".", " ")} \n`;
            }
            return (prev && ruleResult);
        }, true);
        setRuleMessage(message);

        return finalResult;
    }

    const getStrategyDetails = async () => {
        // console.log(selectedTicker, basicInfo, selectedStrategy);
        setLoadingStrategyDetails(true);
        let strategy = {
            type: selectedStrategy.id,
            stock_snapshot: { ticker_id: selectedTicker[0].id, external_cache_id: selectedTicker[0].external_cache_id },
            leg_snapshots: [],
            is_public: false,
            target_price_lower: 0, // there is no target price
            target_price_upper: 0, // there is no target price
        };

        legs.map((leg) => {
            let legSnapshot = { is_long: leg.action === "long", units: 1 }
            if (leg.type === "option") {
                let contract = {
                    ticker_id: leg.contract.ticker.id,
                    external_cache_id: leg.contract.external_cache_id,
                    is_call: leg.contract.is_call,
                    strike: leg.contract.strike,
                    expiration_timestamp: leg.contract.expiration
                }
                legSnapshot.contract_snapshot = contract;
            } else if (leg.type === "stock") {
                legSnapshot.stock_snapshot = {
                    ticker_id: selectedTicker[0].id,
                    external_cache_id: selectedTicker[0].external_cache_id,
                };
            } else {
                legSnapshot.cash_snapshot = true;
            }
            strategy.leg_snapshots.push(legSnapshot);
        });

        try {
            const { accessToken } = authState;
            let url = `${API_URL}/trade_snapshots`;
            const response = await Axios.post(url, strategy, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            console.log(response.data);
            setStrategyDetails(response.data.trade_snapshot);
        } catch (error) {
            console.error(error);
        }
        setLoadingStrategyDetails(false);
    }

    return (
        <Container fluid className="min-vh-100">
            <ModalSpinner active={modalActive}></ModalSpinner>
            <Row className="mb-3">
                <Col lg="4">
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        setModalActive={setModalActive}
                    />
                </Col>

                <Col lg="8">
                    <Select
                        className="basic-single"
                        isSearchable
                        isClearable
                        options={strategies}
                        getOptionLabel={(option) => option.name}
                        isOptionSelected={(option, array) => array.some(strat => strat.name === option.name)}
                        placeholder="Select a strategy..."
                        value={selectedStrategy}
                        onChange={(val) => applyStrategy(val)}
                        onInputChange={(val) => throttledSetInputText(val)}
                    />
                </Col>
            </Row>

            {(!selectedStrategy) ?
                <>
                    <Row className="justify-content-center mb-3">
                        <Col lg="auto">
                            <ToggleButtonGroup type="radio" name="options" defaultValue={sentiment} size="lg" onChange={(e) => setSentiment(e)}>
                                <ToggleButton variant="secondary" value={"all"}>all</ToggleButton>
                                <ToggleButton variant="secondary" value={"bull"}><MdArrowUpward /></ToggleButton>
                                <ToggleButton variant="secondary" value={"bear"}><MdArrowDownward /></ToggleButton>
                                <ToggleButton variant="secondary" value={"flat"}><MdTrendingFlat /></ToggleButton>
                                <ToggleButton variant="secondary" value={"volitile"}><MdShowChart /></ToggleButton>
                            </ToggleButtonGroup>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <CardColumns className="d-flex justify-content-center w-100">
                            {strategies.map(val => {
                                if (val.name.toLowerCase().includes(inputText.toLowerCase()) && (sentiment === "all" || val.sentiment.includes(sentiment))) {
                                    return (
                                        <Col lg="3" key={val.id}>
                                            <Card>
                                                <Card.Header> {val.name} </Card.Header>
                                                <Card.Title> Test</Card.Title>
                                                <Card.Text>test text</Card.Text>
                                                <a href="#" className="stretched-link" onClick={(e) => { e.preventDefault(); applyStrategy(val) }}></a>
                                            </Card>
                                        </Col>
                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </CardColumns>
                    </Row>
                </>

                :
                <>
                    <Row className="mb-3">
                        <Col lg="4">
                            {basicInfo.symbol ?
                                <div className="h-100">
                                    <TickerSummary basicInfo={basicInfo} />
                                    <div className="h-75">
                                        <TradingViewWidget
                                            symbol={basicInfo.symbol}
                                            autosize
                                        />
                                    </div>
                                </div>
                                :
                                null
                            }
                        </Col>
                        <Col lg="8">
                            <Row>
                                <Col>
                                    {legs.map((leg, idx) => {
                                        switch (leg.type) {
                                            case "option":
                                                return (
                                                    <Card className="mb-3">
                                                        <Card.Header>
                                                            <Form>
                                                                <Form.Row>
                                                                    <Col>
                                                                        <Form.Control as="select" value={leg.action} onChange={(e) => updateLeg("action", e.target.value, idx)} disabled={selectedStrategy.legs[idx].action}>
                                                                            <option value="long" key="long">Long</option>
                                                                            <option value="short" key="short">Short</option>
                                                                        </Form.Control>
                                                                    </Col>
                                                                    <Col>
                                                                        <Form.Control as="select" value={leg.optionType} onChange={(e) => updateLeg("optionType", e.target.value, idx)} disabled={selectedStrategy.legs[idx].optionType}>
                                                                            <option value="call" key="call">Call</option>
                                                                            <option value="put" key="put">Put</option>
                                                                        </Form.Control>
                                                                    </Col>
                                                                    <Col>
                                                                        <Form.Control as="select" value={leg.expiration || 0} onChange={(e) => updateLeg("expiration", e.target.value, idx)} disabled={selectedStrategy.legs[idx].expiration}>
                                                                            {expirationTimestamps.map(val => {
                                                                                return (<option value={val} key={val}>{new Date(val < 9999999999 ? val * 1000 : val).toLocaleDateString()}</option>);
                                                                            })}
                                                                            <option disabled value={0} key="blank">Select an expiration</option>
                                                                        </Form.Control>
                                                                    </Col>
                                                                </Form.Row>
                                                            </Form>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <LegCardDetails legs={legs} index={idx} selectedTicker={selectedTicker} atmPrice={basicInfo.regularMarketPrice} updateLeg={updateLeg} />
                                                        </Card.Body>
                                                    </Card>
                                                );
                                            case "stock":
                                                return (
                                                    <Card className="mb-3">
                                                        <Card.Header>{leg.ticker} Shares</Card.Header>
                                                        <Card.Body>
                                                            <LegCardDetails legs={legs} index={idx} selectedTicker={selectedTicker} updateLeg={updateLeg} />
                                                        </Card.Body>
                                                    </Card>
                                                );
                                            case "cash":
                                                return (
                                                    <Card className="mb-3">
                                                        <Card.Header>Cash</Card.Header>
                                                        <Card.Body>
                                                            <LegCardDetails legs={legs} index={idx} selectedTicker={selectedTicker} updateLeg={updateLeg} />
                                                        </Card.Body>
                                                    </Card>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                    <Button disabled={(selectedTicker.length < 1 || !legs.reduce((prevVal, currVal) => (prevVal && !isEmpty(currVal.contract)), true)) || ruleMessage} onClick={getStrategyDetails}>Calculate Strategy Details</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Spinner hidden={!loadingStrategyDetails} animation="grow" role="status">
                                <span className="sr-only"></span>
                            </Spinner>
                            {strategyDetails ?
                                <TradeDetailsCard
                                    trade={strategyDetails}
                                />
                                :
                                <Alert hidden={!ruleMessage} variant='danger' onClose={() => setRuleMessage("")} dismissible>{ruleMessage}</Alert>
                            }
                        </Col>
                    </Row>
                </>
            }


        </Container>
    )
}