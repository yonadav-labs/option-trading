from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
import requests
import os

from tiger.serializers import TickerSerializer, BuyCallSerializer, SellCoveredCallSerializer, UserSerializer
from tiger.models import Ticker, User
from tiger.classes import BuyCall, SellCoveredCall


def get_valid_calls(ticker, request, all_expiration_timestamps):
    input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    valid_calls = []
    for ts in input_expiration_timestamps:
        calls, _ = ticker.get_option_contracts(ts)
        valid_calls.append(calls)
    return valid_calls


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
        ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
        expiration_timestamps = ticker.get_expiration_timestamps()
        if expiration_timestamps is None:
            return Response(status=500)
        return Response({'quote': ticker.get_quote(), 'expiration_timestamps': expiration_timestamps})


@api_view(['GET'])
def calls(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    try:
        target_price = float(request.query_params.get('target_price'))
        month_to_gain = float(request.query_params.get('month_to_percent_gain'))
    except Exception:
        raise APIException('Invalid query parameters.')
    if target_price < 0.0 or month_to_gain < 0.0 or month_to_gain > 1.0:
        raise APIException('Invalid query parameters.')

    all_calls = []
    for calls in get_valid_calls(ticker, request, all_expiration_timestamps):
        for call in calls:
            if not BuyCall.is_valid(call):
                continue
            all_calls.append(
                BuyCall(call, ticker.get_quote().get('regularMarketPrice'), target_price,
                        month_to_gain))
    all_calls = list(filter(lambda call: call.gain > 0.0, all_calls))
    all_calls = sorted(all_calls, key=lambda call: call.gain_after_tradeoff, reverse=True)
    if all_calls:
        max_gain_after_tradeoff = all_calls[0].gain_after_tradeoff
        for call in all_calls:
            call.save_normalized_score(max_gain_after_tradeoff)

    return Response({'all_calls': BuyCallSerializer(all_calls, many=True).data})


@api_view(['GET'])
def sell_covered_calls(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')

    all_calls = []
    for calls in get_valid_calls(ticker, request, all_expiration_timestamps):
        for call in calls:
            if not SellCoveredCall.is_valid(call):
                continue
            all_calls.append(
                SellCoveredCall(call, ticker.get_quote().get('regularMarketPrice')))
    all_calls = sorted(all_calls, key=lambda call: (call.strike, call.expiration))
    return Response({'all_calls': SellCoveredCallSerializer(all_calls, many=True).data})

@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, id):
    try: 
        user = User.objects.get(okta_id=id)
    except User.DoesNotExist: 
        headers = {'Authorization': f"SSWS{os.environ['OKTA_API_KEY']}"}
        response = requests.get(f"https://dev-7756696.okta.com/api/v1/users/{id}", headers=headers)
        if response.ok:
            data = response.json()
            user = User(
                okta_id= data["id"],
                username= data["profile"]["login"],
                is_superuser= False,
                first_name= data["profile"]["firstName"],
                last_name= data["profile"]["lastName"],
                email= data["profile"]["email"],
                is_staff= False,
                is_active= True,
                is_subscriber= False,
                watchlist= []
            )
            user.save()
            # return Response(response.json(), status=response.status_code)
        else:
            return Response(response.json(), status=response.status_code)

    if request.method == 'GET': 
        serializer = UserSerializer(user) 
        return JsonResponse(serializer.data)
    elif request.method == 'PUT': 
        user_data = JSONParser().parse(request) 
        serializer = UserSerializer(user, data=user_data) 
        print(user_data)
        if serializer.is_valid(): 
            serializer.save() 
            return JsonResponse(serializer.data) 
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE': 
        user.delete() 
        return JsonResponse({'message': 'User was deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)

    # if request.method == 'GET':
    #     user_obj = get_object_or_404(User, id=user_id)
    #     serializer = UserSerializer(user_obj)
    #     # user_obj = User.objects.get(pk=user_id)
    #     # user_obj = User.objects.filter(id=user_id)
    #     if user_obj is None:
    #         return Response(status=500)
    #     return Response({'user': serializer.data})
    

@api_view(['GET', 'POST', 'DELETE'])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        
        username = request.GET.get('username', None)
        if username is not None:
            users = users.filter(username_icontains=username)
        
        serializer = UserSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False)
        # 'safe=False' for objects serialization
    elif request.method == 'POST':
        user_data = JSONParser().parse(request)
        serializer = UserSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED) 
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        count = User.objects.all().delete()
        return JsonResponse({'message': '{} Users were deleted successfully!'.format(count[0])}, status=status.HTTP_204_NO_CONTENT)
