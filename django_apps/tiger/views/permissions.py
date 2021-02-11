from rest_framework import permissions


class IsSubscribed(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.user.is_authenticated:
            subscription = request.user.get_subscription()

            if subscription:
                return subscription.get_status() == 'ACTIVE'

        return False
