import React from 'react';
import PayPalBtn from '../components/PayPalBtn';

const paypalSubscribe = (data, actions) => {
    return actions.subscription.create({
        'plan_id': "P-5LY74814PT738460SL7IBPJY",
    });
};
const paypalOnError = (err) => {
    console.log("Error")
}
const paypalOnApprove = (data, detail) => {
    // call the backend api to store transaction details
    console.log("Payapl approved")
    console.log(data.subscriptionID)
};

export default function Subscribe() {
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