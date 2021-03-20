from .mock_response import MockResponse


subscription_create_hook_data = {
    "id": "WH-1BC0555320406450P-9CJ269587N931421P",
    "resource_type": "subscription",
    "event_type": "BILLING.SUBSCRIPTION.CREATED",
    "summary": "Subscription created",
    "resource": {
        "quantity": "1",
        "subscriber": {
            "name": {
                "surname": "test_user"
            }
        },
        "links": [
            {
                "href": "https://www.sandbox.paypal.com/webapps/billing/subscriptions?ba_token=BA-218063255K0344432",
                "rel": "approve",
                "method": "GET"
            },
            {
                "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-AJYTF0ULS3G0",
                "rel": "edit",
                "method": "PATCH"
            },
            {
                "href": "https://api.sandbox.paypal.com/v1/billing/subscriptions/I-AJYTF0ULS3G0",
                "rel": "self",
                "method": "GET"
            }
        ],
        "id": "I-BW452GLLEP1G",
        "plan_overridden": False,
        "plan_id": "P-5LY74814PT738460SL7IBPJY",
        "status": "APPROVAL_PENDING"
    },
    "status": "PENDING",
    "transmissions": [
        {
            "webhook_url": "https://ts-paypal.ngrok.io/api/subscription/webhook/create",
            "transmission_id": "7c2ce250-73a0-11eb-8d0d-c15a23748878",
            "status": "PENDING"
        }
    ],
    "event_version": "1.0",
    "resource_version": "2.0"
}


subscription_activate_hook_data = {
    "id": "WH-80T11383T7841422K-0LW39968WE7128227",
    "resource_type": "subscription",
    "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
    "summary": "Subscription activated",
    "resource": {
        "quantity": "1",
        "subscriber": {
            "name": {
                "given_name": "Golda",
                "surname": "Gross"
            },
            "email_address": "jason.5001007@gmail.com",
            "payer_id": "WZQZQQZKM39BQ"
        },
        "plan_overridden": False,
        "shipping_amount": {
            "currency_code": "USD",
            "value": "0.0"
        },
        "billing_info": {
            "outstanding_balance": {
                "currency_code": "USD",
                "value": "0.0"
            },
            "cycle_executions": [
                {
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "cycles_completed": 1,
                    "cycles_remaining": 0,
                    "current_pricing_scheme_version": 2,
                    "total_cycles": 0
                }
            ],
            "last_payment": {
                "amount": {
                    "currency_code": "USD",
                    "value": "5.69"
                },
                "time": "2021-02-20T17:25:56Z"
            },
            "next_billing_time": "2021-03-20T10:00:00Z",
            "failed_payments_count": 0
        },
        "id": "I-BW452GLLEP1G",
        "plan_id": "P-5LY74814PT738460SL7IBPJY",
        "status": "ACTIVE",
        "status_update_time": "2021-02-20T17:25:57Z"
    },
    "status": "SUCCESS",
    "transmissions": [
        {
            "webhook_url": "https://ts-paypal.ngrok.io/api/subscription/webhook/activate",
            "http_status": 200,
            "reason_phrase": "HTTP/1.1 200 Connection established",
            "response_headers": {
                "Referrer-Policy": "same-origin",
                "X-Frame-Options": "DENY",
                "Server": "WSGIServer/0.2 CPython/3.9.1",
                "X-Content-Type-Options": "nosniff",
                "Vary": "Accept, Cookie, Origin",
                "Content-Length": "0",
                "Date": "Sat, 20 Feb 2021 17:26:25 GMT",
                "Allow": "POST, OPTIONS"
            },
            "transmission_id": "bcf31160-73a0-11eb-9c3e-ed8614c1e26e",
            "status": "SUCCESS",
            "timestamp": "2021-02-20T17:26:16Z"
        }
    ],
    "event_version": "1.0",
    "resource_version": "2.0"
}


subscription_cancel_hook_data = {
    "id": "WH-21J55001JS334821V-4GH672972C592520Y",
    "resource_type": "subscription",
    "event_type": "BILLING.SUBSCRIPTION.CANCELLED",
    "summary": "Subscription cancelled",
    "resource": {
        "status_change_note": "Modify plan to I-AJYTF0ULS3G0",
        "quantity": "1",
        "subscriber": {
            "name": {
                "given_name": "Golda",
                "surname": "Gross"
            },
            "email_address": "jason.5001006@gmail.com",
            "payer_id": "WMHV8YN77A8ZN"
        },
        "plan_overridden": False,
        "shipping_amount": {
            "currency_code": "USD",
            "value": "0.0"
        },
        "billing_info": {
            "outstanding_balance": {
                "currency_code": "USD",
                "value": "0.0"
            },
            "cycle_executions": [
                {
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "cycles_completed": 1,
                    "cycles_remaining": 0,
                    "current_pricing_scheme_version": 1,
                    "total_cycles": 0
                }
            ],
            "last_payment": {
                "amount": {
                    "currency_code": "USD",
                    "value": "59.0"
                },
                "time": "2021-02-20T17:16:46Z"
            },
            "failed_payments_count": 0
        },
        "id": "I-BW452GLLEP1G",
        "plan_id": "P-5LY74814PT738460SL7IBPJY",
        "status": "CANCELLED",
    },
    "status": "PENDING",
    "transmissions": [
        {
            "webhook_url": "https://ts-paypal.ngrok.io/api/subscription/webhook/cancel",
            "transmission_id": "cd04d660-73a0-11eb-9c3e-ed8614c1e26e",
            "status": "PENDING"
        }
    ],
    "event_version": "1.0",
    "resource_version": "2.0"
}


def subscription_detail_get(url, headers, **kwargs):
    resp = {
        "id": "I-BW452GLLEP1G",
        "plan_id": "P-5ML4271244454362WXNWU5NQ",
        "start_time": "2019-04-10T07:00:00Z",
        "quantity": "20",
        "shipping_amount": {
            "currency_code": "USD",
            "value": "10.0"
        },
        "subscriber": {
            "shipping_address": {
                "name": {
                    "full_name": "John Doe"
                },
                "address": {
                    "address_line_1": "2211 N First Street",
                    "address_line_2": "Building 17",
                    "admin_area_2": "San Jose",
                    "admin_area_1": "CA",
                    "postal_code": "95131",
                    "country_code": "US"
                }
            },
            "name": {
                "given_name": "John",
                "surname": "Doe"
            },
            "email_address": "customer@example.com",
            "payer_id": "2J6QB8YJQSJRJ"
        },
        "billing_info": {
            "outstanding_balance": {
                "currency_code": "USD",
                "value": "1.0"
            },
            "cycle_executions": [
                {
                    "tenure_type": "TRIAL",
                    "sequence": 1,
                    "cycles_completed": 0,
                    "cycles_remaining": 2,
                    "total_cycles": 2
                },
                {
                    "tenure_type": "TRIAL",
                    "sequence": 2,
                    "cycles_completed": 0,
                    "cycles_remaining": 3,
                    "total_cycles": 3
                },
                {
                    "tenure_type": "REGULAR",
                    "sequence": 3,
                    "cycles_completed": 0,
                    "cycles_remaining": 12,
                    "total_cycles": 12
                }
            ],
            "last_payment": {
                "amount": {
                    "currency_code": "USD",
                    "value": "1.15"
                },
                "time": "2019-04-09T10:27:20Z"
            },
            "next_billing_time": "2019-04-10T10:00:00Z",
            "failed_payments_count": 0
        },
        "create_time": "2019-04-09T10:26:04Z",
        "update_time": "2019-04-09T10:27:27Z",
        "links": [
            {
                "href": "https://api-m.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/cancel",
                "rel": "cancel",
                "method": "POST"
            },
            {
                "href": "https://api-m.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G",
                "rel": "edit",
                "method": "PATCH"
            },
            {
                "href": "https://api-m.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G",
                "rel": "self",
                "method": "GET"
            },
            {
                "href": "https://api-m.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/suspend",
                "rel": "suspend",
                "method": "POST"
            },
            {
                "href": "https://api-m.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/capture",
                "rel": "capture",
                "method": "POST"
            }
        ],
        "status": "ACTIVE",
        "status_update_time": "2019-04-09T10:27:27Z"
    }

    return MockResponse(resp)


def subscription_cancel_post(url, data, headers, **kwargs):
    return MockResponse({}, 204)
