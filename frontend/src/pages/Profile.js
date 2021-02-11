import React, { useEffect, useContext, useState, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import './Profile.css';
import { Button, Form, Modal } from 'react-bootstrap';
import Subscribe from '../components/Subscribe';
import getApiUrl from '../utils';
import { useHistory } from 'react-router-dom';

const Profile = () => {
  const { authState, authService } = useOktaAuth();
  const { user } = useContext(UserContext);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
  const API_URL = getApiUrl();
  const reason = useRef("");
  const history = useHistory();

  const cancelSubscription = () => {
    const { accessToken } = authState;
    fetch(`${API_URL}/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 'reason': reason.current.value !== "" ? "Reason: " + reason.current.value : "User cancelled with no reason" })
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        history.go(0);
      })
      .catch((err) => {
        /* eslint-disable no-console */
        console.error(err);
      });
  }

  useEffect(() => {
  }, [authState, authService]); // Update if authState changes

  if (!user) {
    return (
      <div class="container justify-content-center">
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <>
      <div class="container justify-content-center">
        <div class="card">
          <div class="row">
            <div class="col-md-4 bg-gradient user-profile">
              <div class="card-block text-center text-white">
                <h6 class="f-w-600">{user.email}</h6>
                {user.subscription ?
                  <div>
                    <p>Member</p>
                    <Button onClick={() => setShowCancelSubscriptionModal(true)} >Cancel Subscription</Button>
                  </div>
                  :
                  <Button onClick={() => setShowSubscribeModal(true)} >Subscribe</Button>
                }
              </div>
            </div>
            <div class="col-md-8">
              <div class="card-block">
                <h6 class="b-b-default f-w-600">Information</h6>
                <div class="row">
                  <div class="col-md-6">
                    <p class="f-w-600">Email</p>
                    <h6 class="text-muted">{user.email}</h6>
                    {user.subscription && 
                      <>
                        <p class="f-w-600 mt-4">Next Billing Time</p>
                        <h6 class="text-muted">{user.subscription.detail.next_billing_time}</h6>
                      </>
                    }
                  </div>
                  {/* <div class="col-md-6">
                  <p class="f-w-600">???</p>
                  <h6 class="text-muted">???</h6>
                </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <Subscribe></Subscribe>
        </Modal.Body>
      </Modal>

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
    </>
  );
}

export default Profile;