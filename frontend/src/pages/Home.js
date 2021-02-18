import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Row, Col } from 'react-bootstrap';
import './Home.css';

export default function Home() {
    const [sliderState, setSliderState] = useState("stock select")
    const [pictureState, setPictureState] = useState('slider1.png')

    const sliderSelectHandler = (select) => {
        setSliderState(select)
        switch (select) {
            case 'stock select':
                setPictureState('slider1.png')
                break;
            case 'expiration select':
                setPictureState('slider2.png')
                break;
            case 'price select':
                setPictureState('slider3.png')
                break;
            case 'trade select':
                setPictureState('slider4.png')
                break;

            default:
                break;
        }
    }

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
                                <Link className="btn btn-lg btn-primary ml-3" to="/strategy-screener" role="button">Strategy Screener</Link>
                                <Link className="btn btn-lg btn-secondary mr-3" to="/strategy-composer" role="button">Strategy Composer</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 top-right">
                        <img className="ml-5" src="home-person.png"></img>
                    </div>
                </Row>

                <Row className="p-5">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">Strategy Screener: how it works</h4>
                        <h1 className="find-title">Find the right options trading ideas just for you</h1>
                    </div>
                    <div className="col-lg-5 mb-3">
                        <img className="img-fluid mx-auto d-block" src={pictureState} width="400" height="400" />
                    </div>
                    <div className="col-lg-7">
                        <Row className={sliderState === 'stock select' ? '' : "text-muted"} onMouseEnter={e => sliderSelectHandler('stock select')} onClick={e => sliderSelectHandler('stock select')}>
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold">1</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2>Select a stock by its ticker.</h2>
                                <p className="lead">AAPL, AMZN, TSLA...</p>
                            </span>
                        </Row>
                        <Row className={sliderState === 'expiration select' ? '' : "text-muted"} onMouseEnter={e => sliderSelectHandler('expiration select')} onClick={e => sliderSelectHandler('expiration select')}>
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold ">2</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2>Select an expiration date.</h2>
                                <p className="lead">Timeframe for this trade.</p>
                            </span>
                        </Row>
                        <Row className={sliderState === 'price select' ? '' : "text-muted"} onMouseEnter={e => sliderSelectHandler('price select')} onClick={e => sliderSelectHandler('price select')}>
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold ">3</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2>Enter target stock price.</h2>
                                <p className="lead">Where do you think the stock price will go?</p>
                            </span>
                        </Row>
                        <Row className={sliderState === 'trade select' ? '' : "text-muted"} onMouseEnter={e => sliderSelectHandler('trade select')} onClick={e => sliderSelectHandler('trade select')}>
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold ">4</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2>Get trading ideas.</h2>
                                <p className="lead">We enumerate tens of thousands trading ideas and present the best ones to you.</p>
                            </span>
                        </Row>
                    </div>
                </Row>

                <Row className="p-5">
                    <Col lg="12" className="text-center my-auto">
                        <h3 className="text-primary">Supported options strategies</h3>
                        <br />
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Long Call</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Covered Call</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Long Put</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Cash Secured Put</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Bull call spread</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Bear call spread</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Bear put spread</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>Bull put spread</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
                    <Col lg="2" xs="6" className="text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h4>More coming...</h4>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </Col>
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
        </div>
    );
}