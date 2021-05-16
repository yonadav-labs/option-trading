from django.core.management.base import BaseCommand
from tiger.mailchimp import *
from tiger.models import User


class Command(BaseCommand):
    help = 'Subscribe to Mailchimp'

    def handle(self, *args, **options):
        for user in User.objects.all():
            if not user.email:
                continue

            add_or_update_member(user)

            tags = [
                {'name': 'all', 'status': 'active'},
                {'name': 'pro', 'status': 'active' if user.get_subscription() else 'inactive'}
            ]

            # If not production environment, append '-dev' to every tag.
            if not settings.IS_PROD:
                tags = [{'name': t['name'] + '-dev', 'status': t['status']} for t in tags]

            update_tags(user, tags)
        print('Mailchimp contacts export completed.')
