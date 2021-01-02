import React from 'react';
import PayPalBtn from './PayPalBtn';
import getApiUrl from '../utils';
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from 'react-router-dom';
import { getPaypalPlanId } from '../utils';

export default function Subscribe() {
    const { authState, authService } = useOktaAuth();
    const API_URL = getApiUrl();
    const history = useHistory();

    const paypalSubscribe = (data, actions) => {
        return actions.subscription.create({
            'plan_id': getPaypalPlanId(),
            application_context: {
                shipping_preference: 'NO_SHIPPING'
            }
        });
    };
    const paypalOnError = (err) => {
        console.log("Error");
    }
    const paypalOnApprove = (data, detail) => {
        // call the backend api to store transaction details
        console.log("Payapl approved");
        console.log(data, detail);
        const { accessToken } = authState;
        fetch(`${API_URL}/subscription/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
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
                // console.log(data);
                history.go(0);
            })
            .catch((err) => {
                /* eslint-disable no-console */
                console.error(err);
            });
    };

    return (
        <div>
            <PayPalBtn
                amount="20"
                currency="USD"
                createSubscription={paypalSubscribe}
                onApprove={paypalOnApprove}
                catchError={paypalOnError}
                onError={paypalOnError}
                onCancel={paypalOnError}
            />
        </div>
    );
}