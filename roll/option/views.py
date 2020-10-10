from django.shortcuts import render
from .forms import OptionForm, TickerFrom


def index(request):
    ticker = request.GET.get('ticker')
    return render(request, 'option/index.html', locals())
