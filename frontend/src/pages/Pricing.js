import React, { useContext, useState, useEffect } from 'react';
import { Card, CardDeck, Modal } from 'react-bootstrap';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import Subscribe from '../components/Subscribe';
import { getPaypalMonthlyPlanId, getPaypalYearlyPlanId } from '../utils';
import './Home.css';
import './Pricing.css';


export default function Pricing() {
    const { authState } = useOktaAuth();
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [paypalPlanID, setPaypalPlanID] = useState(null);
    const { user } = useContext(UserContext);

    const subscribeMonthly = () => {
        setShowSubscribeModal(true);
        setPaypalPlanID(getPaypalMonthlyPlanId());
    }

    const subscribeYearly = () => {
        setShowSubscribeModal(true);
        setPaypalPlanID(getPaypalYearlyPlanId());
    }

    const isUserMonthlySubscribed = () => user && user.subscription && user.subscription.paypal_plan_id === getPaypalMonthlyPlanId();
    const isUserYearlySubscribed = () => user && user.subscription && user.subscription.paypal_plan_id === getPaypalYearlyPlanId();

    useEffect(() => {
    }, [user]);

    return (
        <>
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
                        <Card className={"mb-4 pricing-card pricing-card-background " + (isUserMonthlySubscribed() ? 'highlighted' : '')}>
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
                                {authState.isAuthenticated ?
                                    isUserMonthlySubscribed() ? 
                                        <></>
                                        :
                                        <button type="button" class="btn btn-md btn-block btn-light" onClick={() => subscribeMonthly()}>GET STARTED</button>
                                    :
                                    <a href="/signin" class="btn-block btn-light btn-login">GET STARTED</a>
                                }
                            </Card.Body>
                        </Card>

                        <Card className={"mb-4 pricing-card pricing-card-background " + (isUserYearlySubscribed() ? 'highlighted' : '')}>
                            <Card.Header className="pricing-card-header">
                                <h6 class="mt-3 font-weight-bold">ANNUALLY</h6>
                            </Card.Header>
                            <Card.Body className="card-body-right">
                                <div class="badge">MOST POPULAR</div>
                                <h2>$59.00/yr</h2>
                                <h6>Save $9.28 annually</h6>
                                <div className="pt-3 card-list-right">
                                    <ul class="list-unstyled mt-3 mb-4">
                                        <li>&#10003; Includes everything in the monthly plan.</li>
                                        <li>&nbsp;</li>
                                        <li>&nbsp;</li>
                                    </ul>
                                </div>
                                {authState.isAuthenticated ?
                                    isUserYearlySubscribed() ?
                                        <></>
                                        :
                                        <button type="button" class="btn btn-md btn-block btn-light" onClick={() => subscribeYearly()}>GET STARTED</button>
                                    :
                                    <a href="/signin" class="btn-block btn-light btn-login">GET STARTED</a>
                                }
                            </Card.Body>
                        </Card>
                    </CardDeck>
                </div>
            </div>

            {user &&
                <Modal
                    show={showSubscribeModal}
                    onHide={() => setShowSubscribeModal(false)}
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