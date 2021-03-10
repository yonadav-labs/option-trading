from rest_framework import serializers

from tiger.models import Blog


class BlogListSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%m/%d/%Y')

    class Meta:
        model = Blog
        exclude = ('slide_link',)


class BlogDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(format='%m/%d/%Y')
    
    class Meta:
        model = Blog
        fields = '__all__'
