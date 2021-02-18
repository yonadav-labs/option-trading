import { PayPalButton } from "react-paypal-button-v2";
import React from 'react';
import { getPaypalClientId } from '../utils';

export default function PayPalBtn(props) {
    const { createSubscription, onApprove, catchError, onError, onCancel } = props;
    return (
        // TODO: add venmo.
        <PayPalButton
            createSubscription={(data, details) => createSubscription(data, details)}
            onApprove={(data, details) => onApprove(data, details)}
            onError={(err) => onError(err)}
            catchError={(err) => catchError(err)}
            onCancel={(err) => onCancel(err)}
            options={{ clientId: getPaypalClientId(), vault: true }}
            style={{
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'subscribe'
            }}
        />
    );
}