import yfinance as yf
import pandas as pd
import numpy as np
import json

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from tiger.forms import OptionForm
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response

from tiger.serializers import TickerSerializer
from tiger.models import Ticker, ExternalRequestCache
from tiger.yahoo import get_yahoo_option_url, get_expiration_datetimes


def about(request):
    return render(request, 'tiger/disclaimer.html')


def index(request):
    ticker_symbol = request.GET.get('ticker', '')
    if ticker_symbol:
        ticker = yf.Ticker(ticker_symbol.upper())
        form = OptionForm([(option, option) for option in ticker.options])
    return render(request, 'tiger/index.html', locals())


@api_view(['GET'])
def ticker_list(request, format=None):
    """
    List all tickers that have option.
    """
    if request.method == 'GET':
        tickers = Ticker.objects.filter(status="unspecified")
        serializer = TickerSerializer(tickers, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def ticker(request, ticker_symbol, format=None):
    if request.method == 'GET':
        get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
        request_url = get_yahoo_option_url(ticker_symbol.upper())

        request_cache = ExternalRequestCache.objects.get_or_fetch_external_api(request_url)
        if request_cache is None:
            return Response(status=500)

        response = json.loads(request_cache.response_blob)
        expiration_datetimes = get_expiration_datetimes(response)
        if expiration_datetimes is None:
            return Response(status=500)

        return Response({'expiration_dates': [dt.strftime("%m-%d-%Y") for dt in expiration_datetimes]})


def best_call(request, ticker_symbol):
    def is_number(s):
        try:
            float(s)
            return True
        except ValueError:
            return False

    def calculate_gain(target_price, strike, mid_price):
        return (target_price - strike - mid_price) / mid_price * 100

    ticker = yf.Ticker(ticker_symbol.upper())
    # TODO: add error handling.
    if not is_number(request.GET.get('target_price')) or not is_number(request.GET.get('month_to_percent_gain')):
        return JsonResponse({'result': []})

    target_price = float(request.GET.get('target_price'))
    month_to_percent_gain = float(request.GET.get('month_to_percent_gain'))
    if not ticker.options or target_price <= 0.0 or month_to_percent_gain < 0.0 or month_to_percent_gain > 1.0:
        return JsonResponse({'result': []})

    all_calls = []
    for expr_date in request.GET.getlist('expiration_dates'):
        option_chain = ticker.option_chain(expr_date)
        calls = option_chain.calls
        calls["expireDate"] = datetime.strptime(expr_date, '%Y-%m-%d')
        all_calls.append(calls)

    if len(all_calls) == 0:
        return JsonResponse({'result': []})

    all_calls = pd.concat(all_calls, ignore_index=True)
    all_calls = all_calls.dropna()
    all_calls = all_calls[all_calls['ask'] > 0.0]

    all_calls['midPrice'] = (all_calls['ask'] + all_calls['bid']) / 2
    all_calls['daysTillExpiration'] = (all_calls['expireDate'] - pd.to_datetime("today")) // np.timedelta64(1, 'D')
    all_calls['breakEven'] = all_calls['strike'] + all_calls['midPrice']
    all_calls['gain'] = all_calls.apply(lambda x: calculate_gain(target_price, x['strike'], x['midPrice']), axis=1)

    all_calls['finalScore'] = all_calls['gain'] + all_calls['daysTillExpiration'] / 30.0 * month_to_percent_gain
    all_calls['finalScore'] = all_calls['finalScore'] / all_calls['finalScore'].max() * 100

    all_calls = all_calls.round(3)
    all_calls['gainText'] = (all_calls['gain']).astype(str) + '%'

    all_calls = all_calls[(all_calls['gain'] > 0)][
        ['expireDate', 'contractSymbol', 'daysTillExpiration', 'ask', 'midPrice', 'strike', 'breakEven', 'gainText',
         'finalScore']].sort_values(by=['finalScore'], ascending=False)

    return JsonResponse(
        {'data': request.GET, 'list_data': request.GET.getlist('expiration_dates'),
         'result': all_calls.to_dict(orient='records')})
