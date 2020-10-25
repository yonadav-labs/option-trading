import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form'
import Base from '../components/Base';
import TradingViewWidget from 'react-tradingview-widget';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import TickerTypeahead from '../components/TickerTypeahead';

export default function Home() {
    const [selectedTicker, setSelectedTicker] = useState([]);
    const [expirationDates, setExpirationDates] = useState([]);
    const [validated, setValidated] = useState(false);
    const tradeoffOptions = [{ value: 0, label: 'No tradeoff' },
    { value: 0.005, label: 'Trade 0.5% gain for 1 month additional expiration time' },
    { value: 0.01, label: 'Trade 1% gain for 1 month additional expiration time' },
    { value: 0.02, label: 'Trade 2% gain for 1 month additional expiration time' },
    { value: 0.03, label: 'Trade 3% gain for 1 month additional expiration time' },
    { value: 0.04, label: 'Trade 4% gain for 1 month additional expiration time' },
    { value: 0.05, label: 'Trade 5% gain for 1 month additional expiration time' },
    { value: 0.06, label: 'Trade 6% gain for 1 month additional expiration time' },
    { value: 0.07, label: 'Trade 7% gain for 1 month additional expiration time' },
    { value: 0.08, label: 'Trade 8% gain for 1 month additional expiration time' },
    { value: 0.09, label: 'Trade 9% gain for 1 month additional expiration time' },
    { value: 0.1, label: 'Trade 10% gain for 1 month additional expiration time' },];

    const handleSubmit = (event) => {
        console.log(event);
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        setValidated(true);
        const formData = new FormData(event.target),
            formDataObj = Object.fromEntries(formData.entries())
        console.log(formDataObj)
    };

    return (
        <Base>
            <Form>
                <Form.Group>
                    <Form.Label className="requiredField"><b>Enter ticker symbol</b>*</Form.Label>
                    <TickerTypeahead
                        setSelectedTicker={setSelectedTicker}
                        setExpirationDates={setExpirationDates}
                    />
                </Form.Group>
            </Form>

            <Accordion>
                <Card>
                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                        Show Chart
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <TradingViewWidget
                                symbol={selectedTicker.length > 0 ? selectedTicker[0].symbol : ""}
                            />
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
            {selectedTicker.length > 0 ?
                <div>
                    <br />
                    <h4>Call option optimizer</h4>
                    <hr />
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Target price (USD)*</Form.Label>
                            <Form.Control as="input" type="number" placeholder="100.0" min="0.0" required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Expiration Dates</Form.Label>
                            {expirationDates.map((date) => (
                                <Form.Check
                                    type="checkbox"
                                    id={`checkbox-${date}`}
                                    label={date}
                                />
                            ))}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Month to percentage gain tradeoff*</Form.Label>
                            <Form.Control as="select" defaultValue={0} required>
                                {
                                    tradeoffOptions.map((option, index) => {
                                        return (<option key={index} value={option.value}>{option.label}</option>)
                                    })
                                }
                            </Form.Control>
                        </Form.Group>
                        <Button type="submit">Give me the best contracts!</Button>
                    </Form>
                </div>
                :
                null
            }
        </Base>
    );
}