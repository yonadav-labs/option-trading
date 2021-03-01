import React, { Children, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

const Slide = ({ imgSrc, heading, text }) => {

    return (
        <></>
    );
}

export default function VerticalCarousel(props) {
    const [activeSlide, setActiveSlide] = useState(0);
    const childrenArray = Children.toArray(props.children);

    return (
        <>
            <Col lg="5">
                <img className={`img-fluid mx-auto d-block ${childrenArray[activeSlide].props.className}`} src={childrenArray[activeSlide].props.imgSrc} width="400" height="400" />
            </Col>
            <Col lg="7">
                {Children.map(props.children, (child, i) =>
                    <Row className={activeSlide === i ? "" : "text-muted"} onMouseEnter={e => setActiveSlide(i)} onClick={e => setActiveSlide(i)}>
                        <Col lg="1">
                            <h2 className="display-4 font-weight-bold">{i + 1}</h2>
                        </Col>
                        <Col lg="11">
                            <h2>{child.props.heading}</h2>
                            <p className="lead">{child.props.text}</p>
                        </Col>
                    </Row>
                )}
            </Col>
        </>
    );
}

VerticalCarousel.Slide = Slide;

Slide.propTypes = {
    imgSrc: PropTypes.string.isRequired,
    heading: PropTypes.string.isRequired,
    text: PropTypes.string
};