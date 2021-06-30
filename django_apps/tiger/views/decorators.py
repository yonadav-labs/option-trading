import six
from rest_framework_tracking.mixins import LoggingMixin


def tracking_api(logging_methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], sensitive_fields={}):

    def decorator(func):
        TrackingWrappedAPIView = type(
            six.PY3 and 'TrackingWrappedAPIView' or b'TrackingWrappedAPIView',
            (LoggingMixin, func.view_class),
            {'__doc__': func.__doc__})

        TrackingWrappedAPIView.logging_methods = logging_methods

        if sensitive_fields:
            TrackingWrappedAPIView.sensitive_fields = sensitive_fields

        return TrackingWrappedAPIView.as_view()
    return decorator
