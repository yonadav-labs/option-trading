from mozilla_django_oidc.auth import OIDCAuthenticationBackend

class TigerAuth(OIDCAuthenticationBackend):
    def create_user(self, claims):
        user = super(TigerAuth, self).create_user(claims)

        user.okta_id = claims.get('sub', 'default_token')
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.save()

        return user

    def update_user(self, user, claims):
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.save()

        return user
