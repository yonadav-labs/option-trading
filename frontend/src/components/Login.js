import React, { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import * as OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

import getOktaConfig from "./../oktaConfig";

const Login = () => {
    const { authService } = useOktaAuth();

    useEffect(() => {
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
            features: { registration: true, router: true }
        });

        widget.renderEl(
            { el: '#sign-in-widget' },
            ({ tokens }) => {
                if (tokens) {
                    // Add tokens to storage
                    const tokenManager = authService.getTokenManager();
                    tokenManager.add('idToken', tokens.idToken);
                    tokenManager.add('accessToken', tokens.accessToken);

                    // Return to the original URL (if auth was initiated from a secure route), falls back to the origin
                    const fromUri = authService.getFromUri();
                    if (document.referrer === "" || document.referrer.includes("signin") || document.referrer.includes("verify-email")) {
                        window.location.assign(fromUri);
                    } else {
                        window.location.assign(document.referrer);
                    }
                }
            },
            (err) => {
                throw err;
            },
        );
    }, [authService]);

    return (
        <div className="min-vh-100">
            <div id="sign-in-widget" />
        </div>
    );
};
export default Login;
