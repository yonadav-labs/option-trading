import React from 'react';
import PayPalBtn from './PayPalBtn';
import { useHistory } from 'react-router-dom';

export default function Subscribe({username, plan_id}) {
    const history = useHistory();

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
                createSubscription={paypalSubscribe}
                onApprove={paypalOnApprove}
                catchError={paypalOnError}
                onError={paypalOnError}
                onCancel={paypalOnError}
            />
        </div>
    );
}