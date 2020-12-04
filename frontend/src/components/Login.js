import React, { useEffect } from "react";
import * as OktaSignIn from "@okta/okta-signin-widget";
import "@okta/okta-signin-widget/dist/css/okta-sign-in.min.css";

import getOktaConfig from "./../oktaConfig";

export default function Login() {
    const { pkce, issuer, clientId, redirectUri, scopes } = getOktaConfig().oidc;
    const signIn = new OktaSignIn({
        baseUrl: issuer.split("/oauth2")[0],
        clientId,
        redirectUri,
        logo: "/logo192.png",
        i18n: {
            en: {
                'primaryauth.title': 'Sign in TigerStance'
            }
        },
        authParams: {
            pkce,
            issuer,
            display: 'page',
            scopes
        },
        // registration: {
        //     parseSchema: function (schema, onSuccess, onFailure) {
        //         // handle parseSchema callback
        //         onSuccess(schema);
        //     },
        //     preSubmit: function (postData, onSuccess, onFailure) {
        //         // handle preSubmit callback
        //         onSuccess(postData);
        //     },
        //     postSubmit: function (response, onSuccess, onFailure) {
        //         // handle postsubmit callback
        //         onSuccess(response);
        //     }
        // },
        features: { registration: true, router: true }
    });

    useEffect(() => {
        signIn.renderEl(
            { el: '#sign-in-widget' },
            () => { },
            err => {
                throw err;
            }
        );

        // returned function will be called on component unmount 
        return () => {
            signIn.remove();
        }
    }, [])

    return (
        <div>
            <div id="sign-in-widget" />
        </div>
    );
}