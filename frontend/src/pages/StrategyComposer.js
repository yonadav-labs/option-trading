import React, { useState, useCallback } from 'react';
import { Alert, Badge, Button, Card, CardColumns, Col, Container, Form, Row, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { MdTrendingFlat, MdArrowUpward, MdArrowDownward, MdShowChart } from 'react-icons/md';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './StrategyComposer.css';
import { strategies } from '../blobs/Strategies';
import { cloneDeep, constant, get, isEmpty, property, throttle } from 'lodash';
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
import { useLocation } from 'react-router-dom';
import { useSearch } from '../components/querying';

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
    const premiumPriceOptions = [{ value: "market", label: "Market price" }, { value: "mid", label: "Mid/Mark price" }];
    const operators = {
        "<": (a, aProperty, b, bProperty) => { return get(a, aProperty) < get(b, bProperty) },
        "<=": (a, aProperty, b, bProperty) => { return get(a, aProperty) <= get(b, bProperty) },
        ">": (a, aProperty, b, bProperty) => { return get(a, aProperty) > get(b, bProperty) },
        ">=": (a, aProperty, b, bProperty) => { return get(a, aProperty) >= get(b, bProperty) },
        "*": (a, aProperty, aPropertyDefaultVal, b, bProperty, bPropertyDefaultVal) => { return get(a, aProperty, aPropertyDefaultVal) * get(b, bProperty, bPropertyDefaultVal) },
        "-": (a, aProperty, aPropertyDefaultVal, b, bProperty, bPropertyDefaultVal) => { return get(a, aProperty, aPropertyDefaultVal) - get(b, bProperty, bPropertyDefaultVal) }
    }

    const [inputText, setInputText] = useState("");
    const [selectedTicker, setSelectedTicker] = useState("");
    const [selectedPremiumType, setSelectedPremiumType] = useState(premiumPriceOptions[0]);
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
    const location = useLocation();
    const querySymbol = useSearch(location, 'symbol');

    const applyStrategy = (strategy) => {
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
                return checkRulesAndRelationships(prevState, newState, index, key);
            });
        } else {
            setLegs(prevState => {
                const newState = [...prevState.slice(0, index), { ...prevState[index], [key]: value }, ...prevState.slice(index + 1)];
                return checkRulesAndRelationships(prevState, newState, index, key);
            });
        }
        setStrategyDetails(null);
    }

    const checkRulesAndRelationships = (prevState, newState, index, key) => {
        if (prevState[index][key]) {
            enforceRules(selectedStrategy.rules, newState);
        }
        selectedStrategy.relationships.map(relation => {
            const operation = operators[relation.operator];
            newState[relation.legAIndex][relation.legAProperty] = operation(newState[relation.legBIndex], relation.legBProperty, relation.legBPropertyDefaultVal, newState[relation.legCIndex], relation.legCProperty, relation.legCPropertyDefaultVal);
        });
        return newState;
    }

    const enforceRules = (rules, legs) => {
        let message = "";
        const finalResult = rules.reduce((prev, curr) => {
            const legAIndex = curr.legAIndex;
            const legBIndex = curr.legBIndex;
            const legAProperty = curr.legAProperty;
            const legBProperty = curr.legBProperty;
            const operator = curr.operator;
            const ruleResult = operators[operator](legs[legAIndex], legAProperty, legs[legBIndex], legBProperty);
            if (!ruleResult) {
                message += `Leg ${legAIndex + 1}'s ${legAProperty.replace(".", " ")} needs to be ${operator} Leg ${legBIndex + 1}'s ${legBProperty.replace(".", " ")} \n`;
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
            // target_price_lower: 0, // there is no target price
            // target_price_upper: 0, // there is no target price
            premium_type: selectedPremiumType.value,
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
                // console.log(leg)
                legSnapshot.stock_snapshot = {
                    ticker_id: selectedTicker[0].id,
                    external_cache_id: selectedTicker[0].external_cache_id
                };
                legSnapshot.units = leg.shares;
            } else {
                legSnapshot.cash_snapshot = true;
                legSnapshot.units = leg.value;
            }
            strategy.leg_snapshots.push(legSnapshot);
        });

        try {
            let headers = {
                'Content-Type': 'application/json',
            }
            if (authState.isAuthenticated) {
                const { accessToken } = authState;
                headers['Authorization'] = `Bearer ${accessToken}`
            }

            let url = `${API_URL}/trade_snapshots`;
            const response = await Axios.post(url, strategy, {
                headers: headers
            });

            setStrategyDetails(response.data.trade_snapshot);
        } catch (error) {
            console.error(error);
        }
        setLoadingStrategyDetails(false);
    }

    return (
        <Container fluid className="min-vh-100" style={{ "marginTop": "1rem" }}>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <Row className="justify-content-md-center">
                <Col md="4">
                    <Badge variant="secondary">Ticker</Badge>
                    <TickerTypeahead
                        querySymbol={querySymbol}
                        selectedTicker={selectedTicker}
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        setModalActive={setModalActive}
                    />
                </Col>
                <Col md="7">
                    <Badge variant="secondary">Strategy Type</Badge>
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
            <Row className="justify-content-md-center" style={{ marginTop: "1rem" }}>
                <Col md="4">
                    {basicInfo.symbol ?
                        <div className="h-100">
                            <TickerSummary basicInfo={basicInfo} />
                            <div style={{ maxWidth: '30rem', height: '20rem' }}>
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
                <Col md="7">
                    {(!selectedStrategy) ?
                        <Row className="mb-3">
                            <Col className="d-flex justify-content-center">
                                <ToggleButtonGroup type="radio" name="options" style={{zIndex:0}} defaultValue={sentiment} size="lg" onChange={(e) => setSentiment(e)}>
                                    <ToggleButton variant="secondary" value={"all"}>all</ToggleButton>
                                    <ToggleButton variant="secondary" value={"bull"}><MdArrowUpward /></ToggleButton>
                                    <ToggleButton variant="secondary" value={"bear"}><MdArrowDownward /></ToggleButton>
                                    <ToggleButton variant="secondary" value={"flat"}><MdTrendingFlat /></ToggleButton>
                                    <ToggleButton variant="secondary" value={"volitile"}><MdShowChart /></ToggleButton>
                                </ToggleButtonGroup>
                            </Col>
                        </Row>
                        :
                        null
                    }
                    <Row className="mb-3">
                        <Col>
                            {(!selectedStrategy) ?
                                <CardColumns>
                                    {strategies.map(val => {
                                        if (val.name.toLowerCase().includes(inputText.toLowerCase()) && (sentiment === "all" || val.sentiment.includes(sentiment))) {
                                            return (
                                                <Col key={val.id + "_col"}>
                                                    <Card key={val.id + "_card"}>
                                                        <Card.Header> {val.name} </Card.Header>
                                                        <Card.Body>
                                                            <Card.Text>{val.description}</Card.Text>
                                                        </Card.Body>
                                                        <a href="#" className="stretched-link" onClick={(e) => { e.preventDefault(); applyStrategy(val) }}></a>
                                                    </Card>
                                                </Col>
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}
                                </CardColumns>
                                :
                                <Row>
                                    <Col>
                                        {legs.map((leg, idx) => {
                                            switch (leg.type) {
                                                case "option":
                                                    return (
                                                        <Card key={"leg_" + idx + "_card"} className="mb-3">
                                                            <Card.Header>
                                                                <Row>
                                                                    <Col className="d-flex justify-content-center"><h4>Leg {idx + 1}</h4></Col>
                                                                </Row>
                                                            </Card.Header>
                                                            <Card.Body>
                                                                <LegCardDetails legs={legs} index={idx} selectedTicker={selectedTicker} atmPrice={basicInfo.regularMarketPrice} updateLeg={updateLeg} selectedStrategy={selectedStrategy} expirationTimestamps={expirationTimestamps} />
                                                            </Card.Body>
                                                        </Card>
                                                    );
                                                case "stock":
                                                    return (
                                                        <Card key={"leg_" + idx + "_card"} className="mb-3">
                                                            <Card.Header>
                                                                <Row>
                                                                    <Col className="d-flex justify-content-center"><h4>Leg {idx + 1}</h4></Col>
                                                                </Row>
                                                            </Card.Header>
                                                            <Card.Body>
                                                                <Row>
                                                                    <Col>
                                                                        <Badge variant="secondary">Shares</Badge>
                                                                    </Col>
                                                                </Row>
                                                                <LegCardDetails legs={legs} index={idx} selectedTicker={selectedTicker} updateLeg={updateLeg} />
                                                            </Card.Body>
                                                        </Card>
                                                    );
                                                case "cash":
                                                    return (
                                                        <Card key={"leg_" + idx + "_card"} className="mb-3">
                                                            <Card.Header>
                                                                <Row>
                                                                    <Col className="d-flex justify-content-center"><h4>Leg {idx + 1}</h4></Col>
                                                                </Row>
                                                            </Card.Header>
                                                            <Card.Body>
                                                                <Row>
                                                                    <Col>
                                                                        <Badge variant="secondary">Cash</Badge>
                                                                    </Col>
                                                                </Row>
                                                                <LegCardDetails legs={legs} index={idx} selectedTicker={selectedTicker} updateLeg={updateLeg} />
                                                            </Card.Body>
                                                        </Card>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                        <Col lg="4" className="mb-3">
                                            <Badge variant="secondary">Premium Price to Use</Badge>
                                            <Select
                                                className="basic-single"
                                                isSearchable
                                                isClearable
                                                options={premiumPriceOptions}
                                                placeholder="Premium type..."
                                                value={selectedPremiumType}
                                                onChange={(val) => setSelectedPremiumType(val)}
                                            />
                                        </Col>
                                        <Col lg="auto">
                                            <Button disabled={(selectedTicker.length < 1 || !legs.reduce((prevVal, currVal) => (currVal.type !== "option" || prevVal && !isEmpty(currVal.contract)), true)) || ruleMessage} onClick={getStrategyDetails}>Calculate Strategy Details</Button>
                                        </Col>
                                    </Col>
                                </Row>
                            }
                            <Row style={{ marginTop: '1rem' }}>
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
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}