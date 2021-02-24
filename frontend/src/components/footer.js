import React from 'react'
import { Col, Row } from 'react-bootstrap';
import { Link } from "react-router-dom"
import { TwitterTimelineEmbed } from 'react-twitter-embed';


function Footer(props) {
    return (
        <div className={`container-fluid ${props.class}`} style={{ background: '#2A2A2A' }} >
            {/* <hr className="featurette-divider-last" /> */}
            <footer className="featurette-divider-last">
                <Row>
                    <Col md={4}>
                        <h3 className="text-light">
                            Never get lost in the options chain again.
                        </h3>
                        <p className="text-light">
                            Contact us at contact@tigerstance.com or through this <a href="https://forms.gle/qEqcKb1mtG8PJUWq6" target="_blank">google form</a>.
                        </p>
                    </Col>
                    <Col md={{ span: 4, offset: 4 }} style={{paddingTop: '1rem',}}>
                        <TwitterTimelineEmbed 
                            sourceType="profile"
                            screenName="EaseandExtra"
                            options={{height: 250,width: 300}}
                            noFooter={true}
                            theme="dark"
                            transparent
                        />
                    </Col>
                    {/* <div className="col-md-2 col-6">
                        <h3 className="text-light">
                            Learn
                        </h3>
                        <p className="text-light">
                            Product
                        </p>
                        <p className="text-light">
                            Solutions
                        </p>
                        <p className="text-light">
                            Pricing
                        </p>
                    </div>
                    <div className="col-md-2 col-6">
                        <h3 className="text-light">
                            Company
                        </h3>
                        <p className="text-light">
                            About
                        </p>
                        <p className="text-light">
                            Contact
                        </p>
                        <p className="text-light">
                            Support
                        </p>
                    </div>
                    <div className="col-md-4 col-12">
                        <h3 className="text-light">
                            Stay up to date
                        </h3>
                        <p className="text-light">
                            Sign up to our newsletter to get notified about any and all brand updates and exclusive information.
                        </p>
                        <p className="text-light">
                            PUT EMAIL INPUT HERE
                        </p>
                    </div> */}
                </Row>
                <hr />
                <Row>
                    <Col>
                        <p className="text-muted">
                            All content and data on tigerstance.com is for informational purposes only, you should not construe
                            any such information or other material as legal, tax, trading, investment, financial, or other advice.
                        See <Link to="/disclaimer" > full legal disclaimer</Link>.
                    </p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p className="text-muted">
                            Data and information on tigerstance.com is provided 'as-is' and solely for informational purposes, not for trading purposes or advice, and is delayed.
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <small className="d-block text-muted">Copyright &copy; 2020-2021 tigerstance.com. All Rights Reserved.</small>
                    </Col>
                </Row>
            </footer>
        </div>
    )
}

export default Footer