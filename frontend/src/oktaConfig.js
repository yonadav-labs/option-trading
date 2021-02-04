const { REACT_APP_OIDC_CLIENT_ID, REACT_APP_OIDC_ISSUER, REACT_APP_OIDC_REDIRECT_URI, REACT_APP_IDP_FB_ID } = process.env;

export default function getOktaConfig() {
  return {
    oidc: {
      clientId: REACT_APP_OIDC_CLIENT_ID,
      issuer: REACT_APP_OIDC_ISSUER,
      redirectUri: REACT_APP_OIDC_REDIRECT_URI,
      idpFbId: REACT_APP_IDP_FB_ID,
      scopes: ['openid', 'profile', 'email'],
      pkce: true
    }
  }
};