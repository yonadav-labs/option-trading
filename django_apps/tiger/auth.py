from mozilla_django_oidc.auth import OIDCAuthenticationBackend

class TigerAuth(OIDCAuthenticationBackend):
    def create_user(self, claims):
        user = super(TigerAuth, self).create_user(claims)

        user.okta_id = claims.get('sub', 'default_token')
        user.save()

        return user