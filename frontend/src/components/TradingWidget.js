import React from 'react'
import TradingViewWidget from 'react-tradingview-widget';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';


function TradingWidget(props) {
    return (
        <Accordion>
            <Card>
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                    <span className="text-dark">Price Chart</span>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <TradingViewWidget
                            symbol={props.symbol}
                        />
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    )
}

export default TradingWidget