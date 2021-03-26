import React, { useEffect, useContext, useState, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import './Profile.css';
import { Button, Form, Modal } from 'react-bootstrap';
import getApiUrl from '../utils';
import { useHistory } from 'react-router-dom';

const Profile = () => {
    const { oktaAuth, authState } = useOktaAuth();
    const { user } = useContext(UserContext);
    const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
    const [brokers, setBrokers] = useState([]);
    const [choosenBrokers, setChoosenBrokers] = useState([]);
    const [resultMsg, setResultMsg] = useState("");

    const API_URL = getApiUrl();
    const reason = useRef("");
    const history = useHistory();

    const cancelSubscription = () => {
        const { accessToken } = authState;
        fetch(`${API_URL}/subscription/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.accessToken}`,
            },
            body: JSON.stringify({ 'reason': reason.current.value !== "" ? "Reason: " + reason.current.value : "User cancelled with no reason" })
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject();
                }
                return response;
            })
            .then((data) => {
                history.go(0);
            })
            .catch((err) => {
                /* eslint-disable no-console */
                console.error(err);
            });
    }

    const onChangeBrokers = (event) => {
        let selected = [];
        let selected_opt=(event.target.selectedOptions);

        setResultMsg("");
        for (let i = 0; i < selected_opt.length; i++){
            selected.push(selected_opt.item(i).value)
        }

        setChoosenBrokers(selected);
    };

    const saveUpdates = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { accessToken } = authState;

        fetch(`${API_URL}/user/set-brokers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.accessToken}`,
            },
            body: JSON.stringify({ 'brokers': choosenBrokers })
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject();
                }
                return response;
            })
            .then((data) => {
                setResultMsg("Saved successfully!");
            })
            .catch((err) => {
                /* eslint-disable no-console */
                console.error(err);
            });
    };

    useEffect(() => {
        if (!authState.isAuthenticated) {
            console.log('Token Expired!');
            history.push('/signin');
        } else {
            const { accessToken } = authState;

            fetch(`${API_URL}/brokers/`, {
                headers: {
                    Authorization: `Bearer ${accessToken.accessToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    setBrokers(data);
                })
                .catch((err) => {
                    /* eslint-disable no-console */
                    console.error(err);
                });
        }
    }, [oktaAuth, authState]); // Update if authState changes

    if (!user || brokers.length == 0) {
        return (
            <div className="container justify-content-center">
                <p>Fetching user profile...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100">
            <div className="container justify-content-center">
                <div className="card">
                    <div className="row">
                        <div className="col-md-4 bg-gradient user-profile">
                            <div className="card-block text-center text-white">
                                <h6 className="f-w-600">{user.email}</h6>
                                {user.subscription ?
                                    <div>
                                        <p>Member</p>
                                        <Button onClick={() => setShowCancelSubscriptionModal(true)} >Cancel Subscription</Button>
                                    </div>
                                    :
                                    <a href="/pricing" className="btn-block btn-light btn-login">Subscribe</a>
                                }
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="card-block">
                                <h6 className="b-b-default f-w-600">Information</h6>
                                <Form onSubmit={saveUpdates}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <p className="f-w-600">Email</p>
                                            <h6 className="text-muted">{user.email}</h6>
                                            {user.subscription && 
                                                <>
                                                    <p className="f-w-600 mt-4">Next Billing Time</p>
                                                    <h6 className="text-muted">{user.subscription.detail.next_billing_time}</h6>
                                                </>
                                            }
                                        </div>
                                        <div className="col-md-12 mt-4">
                                            <Form.Group controlId="id-brokers">
                                                <Form.Label className="d-block">Stock Brokerage</Form.Label>
                                                <small className="d-block mb-2">This setting will be used to estimate commission costs.</small>
                                                <Form.Control
                                                    as="select"
                                                    htmlSize={1}
                                                    defaultValue={user.brokers.length > 0 ? user.brokers[0].id : null}
                                                    onChange={onChangeBrokers}
                                                >
                                                    <option>Choose a broker</option>
                                                    {
                                                        brokers.map(broker => (
                                                            <option key={broker.id} value={broker.id}>{broker.name}</option>
                                                        ))
                                                    }
                                                </Form.Control>
                                            </Form.Group>
                                            <div className="text-success mb-2 mt-0">{resultMsg}</div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Button type="submit" variant="primary">Save Updates</Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                show={showCancelSubscriptionModal}
                onHide={() => setShowCancelSubscriptionModal(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Subscription</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>We are sorry to see you go. If you don't mind, we would appreciate if you could enter your reason for cancelling and/or any feedback you'd like to give us.</p>
                    <Form>
                        <Form.Group controlId="cancelSubscription.ReasonTextarea">
                            <Form.Label>Reason</Form.Label>
                            <Form.Control as="textarea" ref={reason} rows={3} placeholder="Optional" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelSubscriptionModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={cancelSubscription} >Submit</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Profile;