from django.shortcuts import render


def index(request):
    return render(request, 'option/index.html', locals())
