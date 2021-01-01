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
                        <p>Understand option contracts in one glance.</p>
                        <div className="center-buttons">
                            <a class="btn btn-lg btn-primary mr-3" href="signin/register" role="button">Sign Up, It’s Free</a>
                            <a class="btn btn-lg btn-secondary ml-3" href="#" role="button">Our Product</a>
                        </div>
                    </div>
                </div>

                <div className="row p-5 min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">Our Mission</h4>
                        <h1>Tigerstance, an AI-empowered option pricing software that provides a one-stop solution for everyday investors.</h1>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Buy Call</h2>
                        <p>Find the best call option contract to buy.</p>
                        <p>
                            <Link className="btn btn-secondary" to="/buy-call" >Get Started</Link>
                        </p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Covered Call</h2>
                        <p>Explore covered call contracts to sell.</p>
                        <p><Link className="btn btn-secondary" to="/sell-covered-call" >Get Started</Link></p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Buy Put</h2>
                        <p>Find the best put option contract to buy.</p>
                        <p><Link className="btn btn-secondary" to="/buy-put" >Get Started</Link></p>
                    </div>
                    <div className="col-lg-3 text-center">
                        <img className="rounded-circle mb-4" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="100" height="100" />
                        <h2>Cash Secured Put</h2>
                        <p>Explore cash secured put contracts to sell.</p>
                        <p><Link className="btn btn-secondary" to="/sell-cash-secured-put" >Get Started</Link></p>
                    </div>
                </div>

                <div className="row p-5 min-vh-100">
                    <div className="col-lg-12 text-center my-auto">
                        <h4 className="text-primary">How it Works</h4>
                        <h1>Find the right contract just for you</h1>
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
                                <h2>Search your stock ticker</h2>
                                <p className="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold text-muted">2</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2 className="text-muted">Enter your price</h2>
                                <p className="lead text-muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold text-muted">3</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2 className="text-muted">Enter your time</h2>
                                <p className="lead text-muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.</p>
                            </span>
                        </div>
                        <div className="row">
                            <span className="col-lg-1">
                                <h2 className="display-4 font-weight-bold text-muted">4</h2>
                            </span>
                            <span className="col-lg-11">
                                <h2 className="text-muted">Get the best trade ideas</h2>
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
                        <h2>“Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius, diam vitae.”</h2>
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