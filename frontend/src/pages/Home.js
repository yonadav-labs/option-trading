import React from 'react';
// import Carousel from "react-bootstrap/Carousel";
import { Link } from "react-router-dom"
import './Home.css';

export default function Home() {
    return (
        <div>
            {/* <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block"
                        src="/images/home/home-banner-1.jpg"
                    />
                    <Carousel.Caption>
                        <h1>We do the math, so you don't have to.</h1>
                        <p>Understand option contracts in one glance.</p>
                        <p>
                            <a class="btn btn-lg btn-primary mr-3" href="signin/register" role="button">SIGN UP</a>
                            <a class="btn btn-lg btn-secondary ml-3" href="#" role="button">OUR PRODUCT</a>
                        </p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="img-responsive d-block"
                        src="/images/home/home-banner-2.jpg"
                    />
                    <Carousel.Caption>
                        <h1>Never get lost in the option chain again.</h1>
                        <p>Find the right contract just for you.</p>
                        <p>
                            <a class="btn btn-lg btn-primary mr-3" href="signin/register" role="button">SIGN UP</a>
                            <a class="btn btn-lg btn-secondary ml-3" href="#" role="button">OUR PRODUCT</a>
                        </p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel> */}

            <div className="container-fluid home-background">
                {/* <img src={HeroRight} alt="hero-right" /> */}
                <div className="row p-5 min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h1>We do the math, so you don't have to.</h1>
                        <h4>Find your next options trading opportunity in one glance.</h4>
                        <div className="center-buttons">
                            {/* <a class="btn btn-lg btn-primary mr-3" href="signin/register" role="button">Sign Up, It’s Free</a>
                            <a class="btn btn-lg btn-secondary ml-3" href="#" role="button">Our Product</a> */}
                            <Link className="btn btn-lg btn-secondary ml-3" to="/strategy-screener" role="button">Strategy Screener</Link>
                            <Link className="btn btn-lg btn-primary mr-3" to="/option-screener" role="button">Option Screener</Link>
                        </div>
                    </div>
                </div>

                <div className="row p-5 min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">Our Mission</h4>
                        <h2>Tigerstance helps investors like you to find and understand options trading opportunities.</h2>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Long Call</h2>
                        <p>Find the best call options to buy.</p>
                        <p>
                            <Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link>
                        </p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Covered Call</h2>
                        <p>Explore covered calls to sell.</p>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Long Put</h2>
                        <p>Find the best puts to buy.</p>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Cash Secured Put</h2>
                        <p>Explore cash secured puts to sell.</p>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Bull call spread</h2>
                        <p>Explore the best bull call spread to buy.</p>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>More strategies coming...</h2>
                        <p>Stay tuned.</p>
                        <p><Link className="btn btn-secondary" to="/strategy-screener" >Get Started</Link></p>
                    </div>
                </div>

                <div className="row p-5 min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">How it Works</h4>
                        <h1 className="find-title">Find the right options trading ideas just for you</h1>
                    </div>
                    <div className="col-lg-5 mb-3">
                        <img className="img-fluid mx-auto d-block" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="400" height="400" />
                    </div>
                    <div className="col-lg-7">
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold">1</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2>Search for your stock ticker</h2>
                                <p className="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold text-muted">2</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2 className="text-muted">Select a expiration date</h2>
                                <p className="lead text-muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold text-muted">3</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2 className="text-muted">Enter your target price</h2>
                                <p className="lead text-muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold text-muted">4</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2 className="text-muted">Get the trading ideas</h2>
                                <p className="lead text-muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="row p-5 justify-content-center min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">Testimonials</h4>
                        <h1>Our Customers Love Us</h1>
                    </div>
                    <div className="col-lg-12 text-center">
                        <h2>“Tigerstance helps me make decisions with ease and confidence in this volatile market.”</h2>
                    </div>
                    <div className="row col-lg-6 justify-content-center">
                        <div className="col-lg-2 text-center">
                            <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="70" height="70" />
                        </div>
                        <div className="col-lg-2 text-center">
                            <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="70" height="70" />
                        </div>
                        <div className="col-lg-2 text-center">
                            <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="70" height="70" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}