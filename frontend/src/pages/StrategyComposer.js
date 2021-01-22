import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button, Card, CardColumns, CardDeck, Col, Container, Dropdown, Form, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { MdTrendingFlat, MdArrowUpward, MdArrowDownward, MdShowChart } from 'react-icons/md';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './StrategyComposer.css';
import { strategies } from '../blobs/Strategies';
import { throttle } from 'lodash';
import TickerTypeahead from '../components/TickerTypeahead';
import ModalSpinner from '../components/ModalSpinner';
import TickerSummary from '../components/TickerSummary';

export function useHorizontalScroll() {
    const elRef = useRef();
    useEffect(() => {
        const el = elRef.current;
        if (el) {
            const onWheel = e => {
                e.preventDefault();
                el.scrollTo({
                    left: el.scrollLeft + e.deltaY * 2,
                    behavior: "smooth"
                });
            };
            el.addEventListener("wheel", onWheel);
            return () => el.removeEventListener("wheel", onWheel);
        }
    }, []);
    return elRef;
}

export default function StrategyComposer() {
    const [inputText, setInputText] = useState("");
    const [selectedTicker, setSelectedTicker] = useState("");
    const [selectedStrategy, setSelectedStrategy] = useState([]);
    const [legs, setLegs] = useState([]);
    const [basicInfo, setbasicInfo] = useState({});
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const throttledSetInputText = useCallback(throttle(setInputText, 600), []);
    const [modalActive, setModalActive] = useState(false);
    const [cp, setCP] = useState("put");

    const onStrategyTypeaheadChange = (selected) => {
        if (selected.length > 0) {
            throttledSetInputText(selected[0].name);
        } else {
            throttledSetInputText("");
        }
        applyStrategy(selected);
    }

    const onStrategyCardClick = (strategy) => {
        applyStrategy([strategy]);
    }

    const onStrategyTypeaheadInputChange = (text) => {
        throttledSetInputText(text);
    }

    const applyStrategy = (strategy) => {
        setSelectedStrategy(strategy);
        if(strategy.length > 0) {
            setLegs(strategy[0].legs);
        }
    }

    const updateLeg = (key, value, index) => {
        setLegs(prevState => ([...prevState.slice(0, index), {...prevState[index], [key]: value}, ...prevState.slice(index+1)]));
    }

    return (
        <Container fluid className="min-vh-100">
            <ModalSpinner active={modalActive}></ModalSpinner>
            <Row className="justify-content-center mb-5">
                <Col lg="auto">
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationTimestamps={setExpirationTimestamps}
                        setbasicInfo={setbasicInfo}
                        setModalActive={setModalActive}
                    />
                </Col>
                <Col lg="auto">
                    <ToggleButtonGroup type="radio" name="options" defaultValue={0} size="lg">
                        <ToggleButton variant="secondary" value={0}>all</ToggleButton>
                        <ToggleButton variant="secondary" value={1}><MdArrowUpward /></ToggleButton>
                        <ToggleButton variant="secondary" value={2}><MdArrowDownward /></ToggleButton>
                        <ToggleButton variant="secondary" value={3}><MdTrendingFlat /></ToggleButton>
                        <ToggleButton variant="secondary" value={4}><MdShowChart /></ToggleButton>
                    </ToggleButtonGroup>
                </Col>
                <Col lg="auto" lg="6">
                    <Typeahead
                        minLengh={2}
                        highlightOnlyResult={true}
                        id="name"
                        labelKey="name"
                        options={strategies}
                        placeholder="Find a strategy..."
                        selected={selectedStrategy}
                        onChange={onStrategyTypeaheadChange}
                        onInputChange={onStrategyTypeaheadInputChange}
                    />
                </Col>
            </Row>

            {(selectedStrategy.length < 1) ?
                <Row className="justify-content-center">
                    <CardColumns className="d-flex justify-content-center w-100">
                        {strategies.map(val => {
                            if (val.name.toLowerCase().includes(inputText.toLowerCase())) {
                                return (
                                    <Col lg="3" key={val.id}>
                                        <Card>
                                            <Card.Header> {val.name} </Card.Header>
                                            <Card.Title> Test</Card.Title>
                                            <Card.Text>test text</Card.Text>
                                            <a href="#" className="stretched-link" onClick={(e) => { e.preventDefault(); onStrategyCardClick(val) }}></a>
                                        </Card>
                                    </Col>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </CardColumns>
                </Row>
                :
                <Row>
                    <Col lg="4">
                        <TickerSummary basicInfo={basicInfo} />
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
                                                                    <Form.Control as="select" value={leg.optionType} onChange={(e) => updateLeg("optionType", e.target.value, idx) } disabled={selectedStrategy[0].legs[idx].optionType}>
                                                                        <option value="call" key="call">Call</option>
                                                                        <option value="put" key="put">Put</option>
                                                                    </Form.Control>
                                                                </Col>
                                                                <Col>
                                                                    <Form.Control as="select" value={leg.action} onChange={(e) => updateLeg("action", e.target.value, idx) } disabled={selectedStrategy[0].legs[idx].action}>
                                                                        <option value="buy" key="buy">Buy</option>
                                                                        <option value="sell" key="sell">Sell</option>
                                                                    </Form.Control>
                                                                </Col>
                                                                <Col>
                                                                    <Form.Control as="select" value={leg.expiration} onChange={(e) => updateLeg("expiration", e.target.value, idx) } disabled={selectedStrategy[0].legs[idx].expiration}>
                                                                        {expirationTimestamps.map(val => {
                                                                            return(<option value={val} key={val}>{new Date(val < 9999999999 ? val * 1000 : val).toLocaleDateString()}</option>);
                                                                        })}
                                                                    </Form.Control>
                                                                </Col>
                                                            </Form.Row>
                                                        </Form>
                                                    </Card.Header>
                                                    <Card.Body>contract details here</Card.Body>
                                                </Card>
                                            );
                                        case "stock":
                                            return (
                                                <Card>
                                                    <Card.Header>{leg.ticker} {leg.shares}</Card.Header>
                                                    <Card.Body>stock details here?</Card.Body>
                                                </Card>
                                            );
                                        case "cash":
                                            return (
                                                <Card>
                                                    <Card.Header>{leg.value}</Card.Header>
                                                    <Card.Body>cash details here?</Card.Body>
                                                </Card>
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                            </Col>
                        </Row>
                        <Row>
                            <Col>trade details</Col>
                            <Col>p/l graph</Col>
                        </Row>
                    </Col>
                </Row>
            }


        </Container>
    )
}