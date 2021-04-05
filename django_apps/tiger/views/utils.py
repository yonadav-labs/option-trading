from django.conf import settings

from tiger.serializers import TradeSnapshotSerializer
from tiger.core.trade.trade_factory import TradeFactory
from tiger.utils import timedelta_from_timestamp
from tiger.models import Broker


def is_low_liquidity(contract):
    return contract.open_interest < 10 or contract.volume == 0


def filter_object_on_attribute(object, filter_key, filter_value):
    """
    Filter object on an attribute by value.
    If an invalid filter key or no filter value is passed, the filter is ignored by returning true.

    Parameters:
        object: An object (a contract or a trade) object or a trade object.
        filter_key (str): A string comprised of <operator>_<attribute>.
        filter_value (any): A value to filter by.

    Returns:
        (boolean): Boolean value representing if object satisfies filter conditions.
    """

    assert isinstance(filter_key, str), 'invalid filter_key: not string'
    tokens = filter_key.split('.', 1)
    assert len(tokens) == 2, 'invalid filter_key: malformatted'
    operator = tokens[0]
    attribute = tokens[1]

    if hasattr(object, attribute):
        if operator == 'eq':
            return getattr(object, attribute) == filter_value
        elif operator == 'max':
            assert (type(filter_value) is float
                    or type(filter_value) is int), 'invalid filter_value: not a float or int'
            return getattr(object, attribute) <= filter_value
        elif operator == 'min':
            assert (type(filter_value) is float
                    or type(filter_value) is int), 'invalid filter_value: not a float or int'
            return getattr(object, attribute) >= filter_value

    return True


def get_valid_contracts(ticker, request, all_expiration_timestamps, filter_low_liquidity=False, filters={}):
    if request.data.get('expiration_timestamps'):
        input_expiration_timestamps = set([int(ts) for ts in request.data.get('expiration_timestamps') if
                                           int(ts) in all_expiration_timestamps])
    else:
        input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                           int(ts) in all_expiration_timestamps])
    call_lists = []
    put_lists = []

    for ts in input_expiration_timestamps:
        calls, puts = ticker.get_call_puts(ts)

        if filter_low_liquidity:
            calls = list(filter(lambda call: not is_low_liquidity(call), calls))
            puts = list(filter(lambda put: not is_low_liquidity(put), puts))

        # apply all filters
        if filters is not None:
            for key, value in filters.items():
                calls = list(filter(lambda call: filter_object_on_attribute(call, key, value), calls))
                puts = list(filter(lambda put: filter_object_on_attribute(put, key, value), puts))

        # filter out inactive contracts.
        call_lists.append(list(filter(lambda call: call.last_trade_date, calls)))
        put_lists.append(list(filter(lambda put: put.last_trade_date, puts)))

    return call_lists, put_lists


def get_filtered_contracts(ticker, expiration_timestamps, filters={}):
    call_lists = []
    put_lists = []
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    expiration_timestamps = set([int(ts) for ts in expiration_timestamps if int(ts) in all_expiration_timestamps])

    for ts in expiration_timestamps:
        calls, puts = ticker.get_call_puts(ts)

        # apply all filters
        if filters is not None:
            for key, value in filters.items():
                calls = list(filter(lambda call: filter_object_on_attribute(call, key, value), calls))
                puts = list(filter(lambda put: filter_object_on_attribute(put, key, value), puts))

        # filter out inactive contracts.
        call_lists.append(list(filter(lambda call: call.last_trade_date, calls)))
        put_lists.append(list(filter(lambda put: put.last_trade_date, puts)))
    return call_lists, put_lists


def get_current_trade(trade_snapshot, broker_settings):
    """
    generates a new trade based on the historic trade snapshot
    returns None if the trade is expired
    """
    trade_snapshot_serializer = TradeSnapshotSerializer(instance=trade_snapshot)
    base_data = trade_snapshot_serializer.data

    ticker = trade_snapshot.stock_snapshot.ticker
    _, stock_cache_id = ticker.get_quote()
    base_data['stock_snapshot']['external_cache_id'] = stock_cache_id

    expired = False
    for leg_snapshot in base_data['leg_snapshots']:
        if leg_snapshot['stock_snapshot']:
            leg_snapshot['stock_snapshot']['external_cache_id'] = stock_cache_id
        elif leg_snapshot['contract_snapshot']:
            expiration_timestamp = leg_snapshot['contract_snapshot']['expiration_timestamp']
            if timedelta_from_timestamp(expiration_timestamp).days < 0:
                expired = True
                break
            _, option_cache_id = ticker.get_request_cache(settings.USE_YAHOO, expiration_timestamp)
            leg_snapshot['contract_snapshot']['external_cache_id'] = option_cache_id

    if expired:
        return None

    trade_snapshot_serializer = TradeSnapshotSerializer(data=base_data)
    trade_snapshot_serializer.is_valid()
    current_data = trade_snapshot_serializer.validated_data
    current_trade = TradeFactory.from_snapshot_dict(current_data, broker_settings)

    return current_trade


def get_broker(user=None):
    broker = None
    if user and user.is_authenticated:
        broker = user.get_broker()

    if not broker:
        broker = Broker.objects.filter(is_default=True).first()

    return broker


def user_disabled_strategy(user, strategy):
    if user and user.is_authenticated:
        disabled_strategies = user.disabled_strategies or []
    else:
        disabled_strategies = ['cash_secured_put', 'bear_call_spread', 'bear_put_spread', 'bull_put_spread']

    return strategy in disabled_strategies
