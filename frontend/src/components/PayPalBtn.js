import { PayPalButton } from "react-paypal-button-v2";
import React from 'react';

export default function PayPalBtn(props) {
    const { amount, currency, createSubscription, onApprove, catchError, onError, onCancel } = props;
    const paypalKey = "AYBME3nnHQTrhS8teRe0ezxdHve057IVYf7B_Mkrwp7RFTJ-txheBCqQvqWZZkievIYvPA9uyFzmmffl"
    return (
        // TODO: add venmo.
        <PayPalButton
            amount={amount}
            currency={currency}
            createSubscription={(data, details) => createSubscription(data, details)}
            onApprove={(data, details) => onApprove(data, details)}
            onError={(err) => onError(err)}
            catchError={(err) => catchError(err)}
            onCancel={(err) => onCancel(err)}
            options={{
                clientId: paypalKey,
                vault: true
            }}
            style={{
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'subscribe'
            }}
        />
    );
}