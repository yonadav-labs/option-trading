import React, { useContext, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Card, CardDeck, Modal } from 'react-bootstrap';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import Subscribe from '../components/Subscribe';
import {
    getPaypalMonthlyPlanId, getPaypalYearlyPlanId, GetGaEventTrackingFunc,
    getPaypalPastMonthlyPlanIds, getPaypalPastYearlyPlanIds
} from '../utils';
import LinkIcon from '@material-ui/icons/Link';
import { IconButton, Tooltip } from '@material-ui/core';
import '../custom.scss';
import './Pricing.css';

const GaEvent = GetGaEventTrackingFunc('user');

export default function Pricing() {
    const { authState } = useOktaAuth();
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [paypalPlanID, setPaypalPlanID] = useState(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const { user } = useContext(UserContext);

    const subscribeMonthly = () => {
        setShowSubscribeModal(true);
        setPaypalPlanID(getPaypalMonthlyPlanId());
    }

    const subscribeYearly = () => {
        setShowSubscribeModal(true);
        setPaypalPlanID(getPaypalYearlyPlanId());
    }

    const copyReferralLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(user.referral_link);
        setTooltipOpen(true);
    }

    const isUserMonthlySubscribed = () => user && user.subscription
        && (user.subscription.paypal_plan_id === getPaypalMonthlyPlanId()
            || getPaypalPastMonthlyPlanIds().indexOf(user.subscription.paypal_plan_id) > -1);

    const isUserYearlySubscribed = () => user && user.subscription
        && (user.subscription.paypal_plan_id === getPaypalYearlyPlanId()
            || getPaypalPastYearlyPlanIds().indexOf(user.subscription.paypal_plan_id) > -1);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Pricing</title>
                <meta name="description" content="How does Tigerstance's pricing work? Tigerstance BASIC is available for free.
                Tigerstance PRO costs $8.25 per month when billed annually and $9.9 per month when billed monthly." />
            </Helmet>
            <div className="container-fluid pricing-background">
                <div className="row m-5">
                    <div className="col-lg-12 text-center">
                        <h1 className="mb-3">Subscription Plans</h1>
                        <h5 className="m-auto pricing-description">
                            Upgrade to Tiger Pro membership to unlock powerful options analytics features.
                            <br />Free trial for a week, cancel anytime.
                        </h5>
                        {user ?
                            <>
                                <h5 className="mx-auto pricing-description mt-4">
                                    Get a free month of Pro membership for you and your friends. <br></br>
                                    Just copy and paste link below to your friends to sign up.
                                </h5>
                                <div className="referral-wrapper">
                                    <span className="referral_link">{user.referral_link}</span>
                                    <Tooltip
                                        PopperProps={{
                                            disablePortal: true,
                                        }}
                                        onClose={() => setTooltipOpen(false)}
                                        open={tooltipOpen}
                                        disableFocusListener
                                        disableHoverListener
                                        disableTouchListener
                                        title="Link copied to clipboard"
                                    >
                                        <IconButton onClick={copyReferralLink}><LinkIcon /></IconButton>
                                    </Tooltip>
                                </div>
                            </>
                            :
                            <h5 className="mx-auto pricing-description mt-3">Get a free month of Pro membership when you signup and refer us to your friends.</h5>
                        }
                    </div>
                </div>

                <div>
                    <CardDeck className="m-3 text-center text-white pricing-card-deck">
                        <Card className={"mb-4 pricing-card pricing-card-background " + (authState.isAuthenticated && !isUserMonthlySubscribed() && !isUserYearlySubscribed() ? 'highlighted' : '')}>
                            <Card.Header className="pricing-card-header">
                                <h6 class="mt-3 font-weight-bold">BASIC</h6>
                            </Card.Header>
                            <Card.Body>
                                <Link className="text-white" to="/signin/register"><h3>Just sign up</h3></Link>
                                <div className="pt-3 card-list-left">
                                    <ul class="list-unstyled mt-3 mb-4">
                                        <li>&#10003; Unlock 9 options trading strategies.</li>
                                        <li>&#10003; Exclusive market <Link to="/reports" className="text-white"><b>reports</b></Link>.</li>
                                        {authState.isAuthenticated ?
                                            <li>&#10003; Strategy <Link to="/profile" className="text-white"><b>personalization</b></Link>.</li>
                                            : <li>&#10003; Strategy personalization.</li>}
                                        {authState.isAuthenticated ?
                                            <li>&#10003; Broker commission cost <Link to="/profile" className="text-white"><b>calculation</b></Link>.</li>
                                            : <li>&#10003; Broker commission cost calculation.</li>}
                                    </ul>
                                </div>
                                {authState.isAuthenticated ?
                                    <></>
                                    :
                                    <Link class="btn-block btn-light btn-login" to="/signin/register">Sign up, it's free</Link>
                                }
                            </Card.Body>
                        </Card>

                        <Card className={"mb-4 pricing-card pricing-card-background " + (isUserMonthlySubscribed() ? 'highlighted' : '')}>
                            <Card.Header className="pricing-card-header">
                                <h6 class="mt-3 font-weight-bold">PRO MONTHLY</h6>
                            </Card.Header>
                            <Card.Body>
                                <h2>$9.9/mo</h2>
                                <div className="pt-3 card-list-left">
                                    <ul class="list-unstyled mt-3 mb-4">
                                        <li>&#10003; Unlock all 21 options strategies.</li>
                                        <li>&#10003; Price target range support in Discover.</li>
                                        <li>&#10003; Unlimited usage for all features.</li>
                                        <li>&#10003; More Pro member features to come!</li>
                                    </ul>
                                </div>
                                {authState.isAuthenticated ?
                                    isUserMonthlySubscribed() ?
                                        <></>
                                        :
                                        <button type="button" class="btn btn-md btn-block btn-light"
                                            onClick={() => {
                                                GaEvent('click subscribe monthly');
                                                subscribeMonthly();
                                            }
                                            }>Join Pro</button>
                                    :
                                    <a href="/signin" class="btn-block btn-light btn-login">Join Pro</a>
                                }
                            </Card.Body>
                        </Card>

                        <Card className={"mb-4 pricing-card pricing-card-background " + (isUserYearlySubscribed() ? 'highlighted' : '')}>
                            <Card.Header className="pricing-card-header">
                                <h6 class="mt-3 font-weight-bold">PRO ANNUALLY</h6>
                            </Card.Header>
                            <Card.Body className="card-body-right">
                                <div class="badge">MOST POPULAR</div>
                                <h2>$99/yr</h2>
                                <h6>Save 16.6% ($19.8) annually</h6>
                                <div className="pt-3 card-list-right">
                                    <ul class="list-unstyled mt-3 mb-4">
                                        <li>&#10003; Everything in the monthly plan.</li>
                                        <li>&nbsp;</li>
                                        <li>&nbsp;</li>
                                        <li>&nbsp;</li>
                                    </ul>
                                </div>
                                {authState.isAuthenticated ?
                                    isUserYearlySubscribed() ?
                                        <></>
                                        :
                                        <button type="button" class="btn btn-md btn-block btn-light"
                                            onClick={() => {
                                                GaEvent('click subscribe yearly');
                                                subscribeYearly();
                                            }}
                                        >Join Pro</button>
                                    :
                                    <a href="/signin" class="btn-block btn-light btn-login">Join Pro</a>
                                }
                            </Card.Body>
                        </Card>
                    </CardDeck>
                </div>
            </div>

            {
                user &&
                <Modal
                    show={showSubscribeModal}
                    onHide={() => {
                        GaEvent('close subscribe modal');
                        setShowSubscribeModal(false);
                    }}
                    backdrop="static"
                    keyboard={false}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Subscribe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Subscribe username={user.username} plan_id={paypalPlanID}></Subscribe>
                    </Modal.Body>
                </Modal>
            }
        </>
    );
}
