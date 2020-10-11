from django.shortcuts import render
from django.http import JsonResponse
from .forms import OptionForm
from datetime import datetime
import yfinance as yf
import pandas as pd
import numpy as np


def index(request):
    ticker_symbol = request.GET.get('ticker', '')
    if ticker_symbol:
        ticker = yf.Ticker(ticker_symbol.upper())
        form = OptionForm([(option, option) for option in ticker.options])
    return render(request, 'option/index.html', locals())


def best_call(request, ticker_symbol):
    ticker = yf.Ticker(ticker_symbol.upper())

    all_calls = []
    for expr_date in request.GET.getlist('expiration_dates'):
        option_chain = ticker.option_chain(expr_date)
        calls = option_chain.calls
        calls["expireDate"] = datetime.strptime(expr_date, '%Y-%m-%d')
        all_calls.append(calls)
    all_calls = pd.concat(all_calls, ignore_index=True)
    all_calls = all_calls.dropna()
    all_calls = all_calls[all_calls['ask'] > 0.0]

    return JsonResponse(
        {'data': request.GET, 'list_data': request.GET.getlist('expiration_dates'),
         'result': all_calls.values.tolist()})
