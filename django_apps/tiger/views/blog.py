from rest_framework import viewsets
from rest_framework.response import Response

from tiger.models import Blog
from tiger.serializers import BlogListSerializer, BlogDetailSerializer


class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
 
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogListSerializer
        else:
            return BlogDetailSerializer
