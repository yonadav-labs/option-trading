from django.core.management.base import BaseCommand

from tiger.models import User
from tiger.mailchimp import *


class Command(BaseCommand):
    help = 'Subscribe to Mailchimp'

    def handle(self, *args, **options):
        tags = ['all']
        for user in User.objects.all():
            if not user.email:
                continue
            add_or_update_member(user, tags)
