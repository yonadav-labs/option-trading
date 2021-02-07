import itertools

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from tiger.models import Ticker
from tiger.serializers import OptionContractSerializer
from tiger.views.utils import get_valid_contracts


@api_view(['GET'])
def contracts(request, ticker_symbol):
    ticker = get_object_or_404(Ticker, symbol=ticker_symbol.upper(), status="unspecified")
    # Check if option is available for this ticker.
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    if all_expiration_timestamps is None:
        raise APIException('No contracts found.')
    call_contract_lists, put_contract_list = get_valid_contracts(ticker, request, all_expiration_timestamps)
    contracts = list(itertools.chain(*call_contract_lists)) + list(itertools.chain(*put_contract_list))
    return Response({'contracts': OptionContractSerializer(contracts, many=True).data})
