import logging

from django.db import connection
from django.http import HttpResponse

logger = logging.getLogger('console_info')


class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # This is a health check request, including database connectivity.
        if request.path_info.endswith('/healthcheck/'):
            healthy = True

            # Check the database for connectivity.
            try:
                with connection.cursor() as cursor:
                    cursor.execute('SELECT COUNT(id) FROM django_migrations')
                    cursor.fetchone()
            except Exception as e:
                logger.error(f'Database health check failed: {e}')
                healthy = False

            if healthy:
                return HttpResponse(status=200)
            else:
                return HttpResponse(status=500)

        # This is a health check request, excluding database connectivity.
        elif request.path_info.endswith('/healthcheck-no-db/'):
            return HttpResponse(status=200)

        # Otherwise, this is a not a health check request, so do not interfere with the request.
        else:
            return self.get_response(request)
