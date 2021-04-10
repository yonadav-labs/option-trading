import hashlib

from django.conf import settings
from mailchimp_marketing import Client
from mailchimp_marketing.api_client import ApiClientError


mailchimp_client = Client()

mailchimp_client.set_config({
    "api_key": settings.MAILCHIMP_API_KEY,
    "server": settings.MAILCHIMP_DATA_CENTER,
})


def create_subscriber_hash(email):
    encoded_email = email.lower().encode()
    hash_code = hashlib.md5(encoded_email).hexdigest()

    return hash_code


def add_or_update_member(user, tags=[]):
    member_info = {
        "email_address": user.email,
        "status_if_new": "subscribed",
        "merge_fields": {
            "FNAME": user.first_name,
            "LNAME": user.last_name,
        },
        "tags": tags
    }
    subscriber_hash = create_subscriber_hash(user.email)

    try:
        resp = mailchimp_client.lists.set_list_member(settings.MAILCHIMP_EMAIL_LIST_ID, subscriber_hash, member_info)
    except ApiClientError as error:
        print("An exception occurred: {}".format(error.text))
