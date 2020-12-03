const { REACT_APP_OIDC_CLIENT_ID, REACT_APP_OIDC_ISSUER, REACT_APP_OIDC_REDIRECT_URI } = process.env;

export default function getOktaConfig() {
  return {
    oidc: {
      clientId: REACT_APP_OIDC_CLIENT_ID,
      issuer: REACT_APP_OIDC_ISSUER,
      redirectUri: REACT_APP_OIDC_REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
      pkce: true
    }
  }
};