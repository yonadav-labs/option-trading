from django.core.management.base import BaseCommand

from tiger.models import User
from tiger.mailchimp import *


class Command(BaseCommand):
    help = 'Subscribe to Mailchimp'

    def handle(self, *args, **options):
        for user in User.objects.all():
            if not user.email:
                continue

            add_or_update_member(user)

            tags = [
                {'name': 'all', 'status': 'active'},
                {'name': 'subscriber', 'status': 'active' if user.get_subscription() else 'inactive'}
            ]
            update_tags(user, tags)
        print('completed.')
