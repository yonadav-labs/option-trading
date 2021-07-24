import itertools

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from tiger.models import Ticker
from tiger.serializers import OptionContractSerializer
from tiger.views.decorators import tracking_api
from tiger.views.utils import get_filtered_contracts


@tracking_api()
@api_view(['POST'])
def contracts(request, ticker_symbol):
    # example: api/tickers/tsla/contracts/
    # body keys should be in this format <operator>.<attribute> ex: min.open_interest, is.strike, max.bid, etc.
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    call_contract_lists, put_contract_list = get_filtered_contracts(ticker, request.data.get('expiration_timestamps'),
                                                                    request.data.get('filters'))
    contracts = list(itertools.chain(*call_contract_lists)) + list(itertools.chain(*put_contract_list))
    return Response({'contracts': OptionContractSerializer(contracts, many=True).data})
