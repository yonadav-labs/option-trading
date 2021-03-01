import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Row, Col } from 'react-bootstrap';
import './Home.css';
import VerticalCarousel from '../components/VerticalCarousel';

export default function Home() {
    
    return (
        <div>
            <div className="container-fluid">
                {/* <img src={HeroRight} alt="hero-right" /> */}
                <Row className="mt-5 mb-5 mx-3 top-container">
                    <div className="col-md-6 top-left">
                        <div className="text-center my-auto">
                            <h1>We do the math, so you don't have to.</h1>
                            <h4>Find your next options trading opportunity in one glance.</h4>
                            <div className="center-buttons">
                                <Link className="btn btn-lg btn-primary ml-3 btn-gradient" to="/strategy-screener" role="button">Strategy Screener</Link>
                                <Link className="btn btn-lg btn-secondary mr-3 btn-white" to="/strategy-builder" role="button">Strategy Builder</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 top-right">
                        <img className="ml-5" src="home-person.png"></img>
                    </div>
                </Row>

                <Row className="p-5 min-vh-100">
                    <Col lg="12" className="text-center my-auto">
                        <h4 className="text-primary">Strategy Screener: how it works</h4>
                        <h1 className="find-title">Find the right options trading ideas just for you</h1>
                    </Col>
                    <VerticalCarousel>
                        <VerticalCarousel.Slide
                            imgSrc="slider1.png"
                            heading="Select a stock by its ticker."
                            text="AAPL, AMZN, TSLA..."
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider2.png"
                            heading="Select an expiration date."
                            text="Timeframe for this trade."
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider3.png"
                            heading="Enter target stock price."
                            text="Where do you think the stock price will go?"
                        />
                        <VerticalCarousel.Slide
                            imgSrc="slider4.png"
                            heading="Get trading ideas."
                            text="We enumerate tens of thousands trading ideas and present the best ones to you."
                        />
                    </VerticalCarousel>
                </Row>

                <Row className="p-5 min-vh-100">
                    <Col lg="12" className="text-center my-auto">
                        <h4 className="text-primary">Strategy Builder</h4>
                        <h1 className="find-title">Build and visualize an option strategy</h1>
                    </Col>
                    <VerticalCarousel>
                        <VerticalCarousel.Slide
                            className="w-100"
                            imgSrc="sc_step_1.png"
                            heading="Select a stock by its ticker."
                            text="AAPL, AMZN, TSLA..."
                        />
                        <VerticalCarousel.Slide
                            className="w-100"
                            imgSrc="sc_step_2.png"
                            heading="Select an option strategy"
                            text="Search for a specific strategy or discover strategies based on your sentiment"
                        />
                        <VerticalCarousel.Slide
                            className="w-100"
                            imgSrc="sc_step_3.png"
                            heading="Complete the legs"
                            text="Build and tweak your strategy leg by leg"
                        />
                        <VerticalCarousel.Slide
                            className="w-100"
                            imgSrc="sc_step_4.png"
                            heading="Receive feedback while you build"
                            text="Not sure how to build the strategy? Informative hints are there to help guide you"
                        />
                        <VerticalCarousel.Slide
                            className="w-75"
                            imgSrc="sc_step_5.png"
                            heading="Visualize and understand your strategy"
                            text="Explore your strategy with the interactive graph and analyze the calculated details"
                        />
                    </VerticalCarousel>
                </Row>

                <Row className="p-5">
                    <Col lg="12" className="text-center my-auto">
                        <h4 className="text-primary">Our Mission</h4>
                        <h2>Tigerstance helps investors like you to find and understand options trading opportunities.</h2>
                    </Col>
                </Row>

                <Row className="p-5 justify-content-center min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">Testimonials</h4>
                        <h1>Our Customers Love Us</h1>
                    </div>
                    <div className="col-lg-12 text-center">
                        <h2>“Tigerstance helps me make decisions with ease and confidence in this volatile market.”</h2>
                    </div>
                    {/* <div className="row col-lg-6 justify-content-center">
                        <div className="col-lg-2 text-center">
                            <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="70" height="70" />
                        </div>
                        <div className="col-lg-2 text-center">
                            <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="70" height="70" />
                        </div>
                        <div className="col-lg-2 text-center">
                            <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="70" height="70" />
                        </div>
                    </div> */}
                </Row>
            </div>
        </div >
    );
}