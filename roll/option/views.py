from django.shortcuts import render
from .forms import OptionForm, TickerFrom


def index(request):
    form = TickerFrom()
    return render(request, 'option/index.html', locals())
