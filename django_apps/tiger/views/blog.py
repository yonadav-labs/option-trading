from rest_framework import viewsets
from rest_framework_tracking.mixins import LoggingMixin

from tiger.models import Blog
from tiger.serializers import BlogListSerializer, BlogDetailSerializer


class BlogViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Blog.objects.all()
 
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogListSerializer
        else:
            return BlogDetailSerializer
