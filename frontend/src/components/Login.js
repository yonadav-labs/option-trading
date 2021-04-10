import React, { useEffect, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import * as OktaSignIn from '@okta/okta-signin-widget';
import { OktaAuth } from '@okta/okta-auth-js';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

import getOktaConfig from "./../oktaConfig";
const oktaAuth = new OktaAuth(getOktaConfig().oidc);

const Login = () => {
    const { oktaAuth } = useOktaAuth();
    const widgetRef = useRef();

    useEffect(() => {
        if (!widgetRef.current) {
            return false;
        }

        const { pkce, issuer, clientId, redirectUri, scopes, idpFbId, idpGlId } = getOktaConfig().oidc;
        const widget = new OktaSignIn({
            baseUrl: issuer.split('/oauth2')[0],
            clientId,
            redirectUri,
            logo: "/logo192.png",
            i18n: {
                en: {
                    'primaryauth.title': 'Sign in Tigerstance'
                },
            },
            authParams: {
                // To avoid redirect do not set "pkce" or "display" here. OKTA-335945
                issuer,
                scopes,
            },
            idps: [
                {type: 'FACEBOOK', id: idpFbId},
                {type: 'GOOGLE', id: idpGlId},
            ],
            idpDisplay: 'SECONDARY',
            registration: {
                postSubmit: function (response, onSuccess, onFailure) {
                    // handle postsubmit callback
                    onSuccess(response);
                    window.location.assign('/signin');
                }
            },
            features: { registration: true, router: true }
        });

        widget.showSignInToGetTokens({
            el: widgetRef.current,
            scopes,
        }).then((tokens) => {
            if (tokens) {
                // Add tokens to storage
                const tokenManager = oktaAuth.tokenManager;
                tokenManager.add('idToken', tokens.idToken);
                tokenManager.add('accessToken', tokens.accessToken);

                // Return to the original URL (if auth was initiated from a secure route), falls back to the origin
                const fromUri = oktaAuth.getOriginalUri();

                if (fromUri !== window.location.origin || document.referrer === "" || document.referrer.includes("signin") || document.referrer.includes("verify-email")) {
                    window.location.assign(fromUri);
                } else {
                    window.location.assign(document.referrer);
                }
                oktaAuth.removeOriginalUri();
            }
        }).catch((err) => {
            throw err;
        });

        return () => widget.remove();
    }, [oktaAuth]);

    return (
        <div className="min-vh-100">
            <div ref={widgetRef} />
        </div>
    );
};
export default Login;
