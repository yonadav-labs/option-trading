import React, { useEffect, useContext, useState, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import './Profile.css';
import { Button, Form, Modal } from 'react-bootstrap';
import getApiUrl, { getAllTradeTypes, getTradeTypeDisplay } from '../utils';
import { useHistory, Link } from 'react-router-dom';

const Profile = () => {
    const { oktaAuth, authState } = useOktaAuth();
    const { user } = useContext(UserContext);
    const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
    const [brokers, setBrokers] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [choosenBrokers, setChoosenBrokers] = useState([]);
    const [disabledStrategies, setDisabledStrategies] = useState([]);
    const [nickName, setNickName] = useState(null);
    const [resultMsg, setResultMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");

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
        let selected_opt = (event.target.selectedOptions);
        setResultMsg("");

        for (let i = 0; i < selected_opt.length; i++) {
            selected.push(selected_opt.item(i).value)
        }

        setChoosenBrokers(selected);
    };

    const onChangeStrategy = (event) => {
        let strategy = event.target.value;
        let disabled_strategies = disabledStrategies.slice();

        setResultMsg("");
        if (event.target.checked) {  // enable -> remove
            let idx = disabled_strategies.indexOf(strategy);
            if (idx > -1) {
                disabled_strategies.splice(idx, 1);
            }
        } else {  // add to disabled
            disabled_strategies.push(strategy)
        }
        setDisabledStrategies(disabled_strategies);
    };

    const onChangeNickName = (event) => {
        setErrMsg("");
        setResultMsg("");
        setNickName(event.target.value.trim());
    };

    const saveUpdates = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { accessToken } = authState;
        let data = { disabled_strategies: disabledStrategies, nick_name: nickName };
        if (choosenBrokers.length > 0) {
            data.brokers = choosenBrokers;
        }

        fetch(`${API_URL}/users/${user.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.accessToken}`,
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then(error => { throw new Error(error.nick_name[0]) })
                }
                return response.json();
            })
            .then((data) => {
                setResultMsg("Saved successfully!");
            })
            .catch((err) => {
                /* eslint-disable no-console */
                setErrMsg(err.message);
            });
    };

    useEffect(() => {
        if (!authState.isAuthenticated) {
            console.log('Token Expired!');
            history.push('/signin');
        } else {
            const { accessToken } = authState;

            // get possible brokers
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

            // get past trades
            fetch(`${API_URL}/trade_snapshots_history`, {
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
                    setTradeHistory(data);
                })
                .catch((err) => {
                    /* eslint-disable no-console */
                    console.error(err);
                });
        }
    }, [oktaAuth, authState]); // Update if authState changes

    useEffect(() => {
        if (user) {
            setNickName(user.nick_name);
            setChoosenBrokers(user.brokers);
            setDisabledStrategies(user.disabled_strategies || []);
        }
    }, [user]);

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
                                        <p>Current plan: Pro member</p>
                                        {user.subscription.type === 'PAYPAL' ?
                                            <>
                                                <p><span className="f-w-600">Next billing time: </span>{user.subscription.detail.next_billing_time}</p>
                                                <Button onClick={() => setShowCancelSubscriptionModal(true)} >Cancel Subscription</Button>
                                            </>
                                            :
                                            <p><span className="f-w-600">Gift membership expiring on: </span>{user.subscription.expire_at}</p>
                                        }
                                    </div>
                                    :
                                    <div>
                                        <p>Current plan: Basic member</p>
                                        <a href="/pricing">
                                            <button type="button" class="btn btn-md btn-block btn-light" style={{ width: '15rem' }}>
                                                <h4>BECOME PRO</h4>
                                            </button>
                                        </a>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="card-block">
                                <h6 className="b-b-default f-w-600">Profile</h6>
                                <div className="row">
                                    <div className="col-md-12">
                                        <p ><span className="f-w-600">Email: </span>{user.email}</p>
                                    </div>
                                </div>
                                <h6 className="b-b-default f-w-600">Settings</h6>
                                <Form onSubmit={saveUpdates}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Form.Group controlId="id-nick-name">
                                                <Form.Label className="d-block">Nick Name</Form.Label>
                                                <Form.Control defaultValue={nickName} onChange={onChangeNickName} placeholder="(emtpy)" />
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Form.Group controlId="id-brokers">
                                                <Form.Label className="d-block">Stock Brokerage</Form.Label>
                                                <small className="d-block mb-2">This setting will be used to estimate commission costs.</small>
                                                <Form.Control
                                                    as="select"
                                                    htmlSize={1}
                                                    defaultValue={user.brokers_detail.length > 0 ? user.brokers_detail[0].id : null}
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
                                        </div>
                                    </div>


                                    <Form.Label className="d-block">Enabled strategies</Form.Label>
                                    <div className="row">
                                        {getAllTradeTypes().map(type => (
                                            <div className="col-lg-4 col-sm-6">
                                                <Form.Check
                                                    key={type}
                                                    id={type}
                                                    type="switch"
                                                    label={getTradeTypeDisplay(type)}
                                                    value={type}
                                                    defaultChecked={!user.disabled_strategies || (user.disabled_strategies.indexOf(type) === -1)}
                                                    onChange={onChangeStrategy}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="text-danger mb-2 mt-0">{errMsg}</div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="text-success mb-2 mt-0">{resultMsg}</div>
                                        </div>
                                        <div className="col-md-12">
                                            <Button type="submit" variant="primary">Save Updates</Button>
                                        </div>
                                    </div>
                                </Form>

                                <h6 className="b-b-default f-w-600 mt-4">Saved positions</h6>
                                <div className="row">
                                    <div className="col-md-12">
                                        {
                                            tradeHistory.length > 0 ?
                                                <ul>
                                                    {tradeHistory.map(x => (
                                                        <li key={x.id}>
                                                            <Link className="d-inline-block" to={"/t/" + x.id} target="_blank">{x.display_name}</Link>
                                                        </li>
                                                    ))}
                                                </ul> :
                                                <div>(empty)</div>
                                        }
                                    </div>
                                </div>
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
                    <Button variant="primary" onClick={cancelSubscription}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </div >
    );
}

export default Profile;