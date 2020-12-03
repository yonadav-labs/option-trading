export default function getOktaConfig() {
  return {
    oidc: {
      clientId: '0oaiu6u2629106dxq5d5',
      issuer: 'https://dev-7756696.okta.com/oauth2/default',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['openid', 'profile', 'email'],
      pkce: true
    }
  }
};