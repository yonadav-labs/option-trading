import React from 'react';
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
                    <h5 className="m-auto pricing-descritpion">
                        Upgrade to Tiger Pro membership to unlock powerful options analytics features.
                        <br />Free trail for a week, cancel anytime.
                    </h5>
                </div>
            </div>

            <div>
                <div class="card-deck m-3 text-center text-white">
                    <div className="card mb-4 card-background">
                        <div class="card-header">
                            <h6 class="mt-3 font-weight-bold">MONTHLY</h6>
                        </div>
                        <div class="card-body">
                            <h2>$5.69/mo</h2>
                            <div className="pt-3 card-list-left">
                                <ul class="list-unstyled mt-3 mb-4">
                                    <li>&#10003; Unlimited usage for all features.</li>
                                    <li>&#10003; Unlock all 22 options trading strategies.</li>
                                    <li>&#10003; More Pro member features to come!</li>
                                </ul>
                            </div>
                            <button type="button" class="btn btn-md btn-block btn-light">GET STARTED</button>
                        </div>
                    </div>

                    <div className="card mb-4 card-background ">
                        <div class="card-header">
                            <h6 class="mt-3 font-weight-bold">YEARLY</h6>
                        </div>
                        <div class="card-body card-body-right">
                            <div class="badge">MOST POPULAR</div>
                            <h2>$59.00/yr</h2>
                            <h6>save 10% yearly</h6>
                            <div className="pt-3 card-list-right">
                                <ul class="list-unstyled mt-3 mb-4">
                                    <li>&#10003; Includes everything in the monthly plan.</li>
                                    <li>&nbsp;</li>
                                    <li>&nbsp;</li>
                                </ul>
                            </div>
                            <button type="button" class="btn btn-md btn-block btn-light">GET STARTED</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}