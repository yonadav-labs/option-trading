import React from 'react';
import { Col, Container, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { MdTrendingFlat, MdArrowUpward, MdArrowDownward, MdShowChart } from 'react-icons/md';

export default function TradeComposer() {

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Typeahead
                        minLengh={2}
                        highlightOnlyResult={true}
                        id="strategy-typeahead"
                        // labelKey="display_label"
                        options={[]}
                        placeholder="Select a strategy"
                    // onChange={onTickerSelectionChange}
                    // filterBy={(option, props) => {
                    //     const uppercase_text = props.text.toUpperCase();
                    //     return option['symbol'].startsWith(uppercase_text);
                    // }}
                    // ref={inputEl}
                    />
                </Col>
                <Col>
                    <ToggleButtonGroup type="radio" name="options" defaultValue={0}>
                        <ToggleButton variant="secondary" value={0}>all</ToggleButton>
                        <ToggleButton variant="secondary" value={1}><MdArrowUpward/></ToggleButton>
                        <ToggleButton variant="secondary" value={2}><MdArrowDownward/></ToggleButton>
                        <ToggleButton variant="secondary" value={3}><MdTrendingFlat/></ToggleButton>
                        <ToggleButton variant="secondary" value={4}><MdShowChart/></ToggleButton>
                    </ToggleButtonGroup>
                </Col>
            </Row>
            <Row>
                {/* TODO put leg cards here */}
            </Row>
            <Row>
                {/* TODO put profit/loss chart here */}
            </Row>
        </Container>
    )
}