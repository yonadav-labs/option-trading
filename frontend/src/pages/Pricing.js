import React from 'react';
import { Card, CardDeck } from 'react-bootstrap';
// import Carousel from "react-bootstrap/Carousel";
import { Link } from "react-router-dom"
import './Home.css';
import './Pricing.css';


export default function Pricing() {
    return (
        <div className="container-fluid pricing-background">
            <div className="row m-5">
                <div className="col-lg-12 text-center">
                    <h1 className="mb-3">Subscription Plans</h1>
                    <h5 className="m-auto pricing-description">
                        Upgrade to Tiger Pro membership to unlock powerful options analytics features.
                        <br />Free trial for a week, cancel anytime.
                    </h5>
                </div>
            </div>

            <div>
                <CardDeck className="m-3 text-center text-white pricing-card-deck">
                    <Card className="mb-4 pricing-card pricing-card-background">
                        <Card.Header className="pricing-card-header">
                            <h6 class="mt-3 font-weight-bold">MONTHLY</h6>
                        </Card.Header>
                        <Card.Body>
                            <h2>$5.69/mo</h2>
                            <div className="pt-3 card-list-left">
                                <ul class="list-unstyled mt-3 mb-4">
                                    <li>&#10003; Unlimited usage for all features.</li>
                                    <li>&#10003; Unlock all 22 options trading strategies.</li>
                                    <li>&#10003; More Pro member features to come!</li>
                                </ul>
                            </div>
                            <button type="button" class="btn btn-md btn-block btn-light">GET STARTED</button>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 pricing-card-background">
                        <Card.Header className="pricing-card-header">
                            <h6 class="mt-3 font-weight-bold">YEARLY</h6>
                        </Card.Header>
                        <Card.Body className="card-body-right">
                            <div class="badge">MOST POPULAR</div>
                            <h2>$59.00/yr</h2>
                            <h6>Save $9.28 yearly</h6>
                            <div className="pt-3 card-list-right">
                                <ul class="list-unstyled mt-3 mb-4">
                                    <li>&#10003; Includes everything in the monthly plan.</li>
                                    <li>&nbsp;</li>
                                    <li>&nbsp;</li>
                                </ul>
                            </div>
                            <button type="button" class="btn btn-md btn-block btn-light">GET STARTED</button>
                        </Card.Body>
                    </Card>
                </CardDeck>
            </div>
        </div>
    );
}