import React from 'react';
import PayPalBtn from './PayPalBtn';
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import getApiUrl, { GetGaEventTrackingFunc } from '../utils';

const GaEvent = GetGaEventTrackingFunc('user');

export default function Subscribe({ username, plan_id }) {
    const history = useHistory();
    const { authState } = useOktaAuth();
    const API_URL = getApiUrl();

    const paypalSubscribe = (data, actions) => {
        return actions.subscription.create({
            'plan_id': plan_id,
            application_context: {
                shipping_preference: 'NO_SHIPPING'
            },
            subscriber: {
                name: {
                    surname: username
                }
            }
        });
    };
    const paypalOnError = (err) => {
        GaEvent('subscribe paypal error');
        console.log("Error");
    };
    const paypalOnApprove = (data, detail) => {
        // call the backend api to store transaction details
        GaEvent('subscribe paypal approved');

        const { accessToken } = authState;
        fetch(`${API_URL}/subscription/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.accessToken}`,
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject();
                }
                return response.json();
            })
            .then((data) => {
                history.go(0);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div>
            <PayPalBtn
                createSubscription={paypalSubscribe}
                onApprove={paypalOnApprove}
                catchError={paypalOnError}
                onError={paypalOnError}
                onCancel={paypalOnError}
            />
        </div>
    );
}