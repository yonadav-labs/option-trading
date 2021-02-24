import logging

from django.conf import settings
from django.db import connection
from django.http import HttpResponse

logger = logging.getLogger('console_info')

class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # If this is a not a health check request, just let the request pass through untouched.
        if request.path_info != '/healthcheck/':
            return self.get_response(request)
        # Otherwise, intercept the request and perfrom a health check.
        else:
            healthy = True

            # Check the database for connectivity.
            try:
                with connection.cursor() as cursor:
                    cursor.execute('SELECT COUNT(id) FROM django_migrations')
                    cursor.fetchone()
            except Exception as e:
                logger.error(f'Database health check failed: {e}')
                healthy = False

            # Return the health check response.
            if healthy:
                return HttpResponse(status = 200)
            else:
                return HttpResponse(status = 500)
