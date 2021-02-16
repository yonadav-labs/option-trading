import React from 'react';
import PayPalBtn from './PayPalBtn';
import getApiUrl from '../utils';
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from 'react-router-dom';
import { getPaypalPlanId } from '../utils';

export default function Subscribe({username}) {
    const { authState, authService } = useOktaAuth();
    const API_URL = getApiUrl();
    const history = useHistory();

    const paypalSubscribe = (data, actions) => {
        return actions.subscription.create({
            'plan_id': getPaypalPlanId(),
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
        console.log("Error");
    }
    const paypalOnApprove = (data, detail) => {
        // call the backend api to store transaction details
        console.log("Payapl approved");
        history.go(0);
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