from pinax.referrals.models import ReferralResponse
from tiger.core.trade.trade_factory import TradeFactory
from tiger.fetcher import get_td_option_url
from tiger.models import Broker
from tiger.serializers import TradeSnapshotSerializer
from tiger.utils import timedelta_from_timestamp


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
        attr_val = getattr(object, attribute)
        if operator == 'eq':
            return attr_val == filter_value
        elif operator == 'max':
            assert (type(filter_value) is float
                    or type(filter_value) is int), 'invalid filter_value: not a float or int: ' + str(filter_value)
            return attr_val is not None and attr_val <= filter_value
        elif operator == 'min':
            assert (type(filter_value) is float
                    or type(filter_value) is int), 'invalid filter_value: not a float or int: ' + str(filter_value)
            return attr_val is not None and attr_val >= filter_value

    return True


def get_valid_contracts(ticker, request, all_expiration_timestamps, filters={}):
    input_expiration_timestamps = set([int(ts) for ts in request.data.get('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    call_lists = []
    put_lists = []

    for ts in input_expiration_timestamps:
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


def get_filtered_contracts(ticker, expiration_timestamps, filters={}):
    call_lists = []
    put_lists = []
    all_expiration_timestamps = ticker.get_expiration_timestamps()
    expiration_timestamps = set([int(ts) for ts in expiration_timestamps
                                 if type(ts) == int and int(ts) in all_expiration_timestamps])

    for ts in expiration_timestamps:
        calls, puts = ticker.get_call_puts(ts)

        # apply all filters
        if filters is not None:
            for key, value in filters.items():
                calls = list(filter(lambda call: filter_object_on_attribute(call, key, value), calls))
                puts = list(filter(lambda put: filter_object_on_attribute(put, key, value), puts))

        # filter out inactive or invalid contracts.
        call_lists.append(list(filter(lambda call: call.last_trade_date and call.implied_volatility, calls)))
        put_lists.append(list(filter(lambda put: put.last_trade_date and put.implied_volatility, puts)))
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
            url = get_td_option_url(ticker.symbol.upper())
            _, option_cache_id = ticker.get_request_cache(url)
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


def get_disabled_or_disallowed_strategies(user):
    if user and user.is_authenticated:
        return set(user.disabled_strategies + user.disallowed_strategies)
    else:
        return set(['cash_secured_put', 'protective_put', 'bear_call_spread', 'bear_put_spread', 'bull_put_spread',
                    'long_straddle', 'long_strangle', 'iron_condor', 'iron_butterfly', 'short_strangle',
                    'short_straddle', 'long_butterfly_spread', 'short_butterfly_spread', 'long_condor_spread',
                    'short_condor_spread', 'strap_straddle', 'strap_strangle'])


def handle_referral(request):
    """
    The referral flow:
    0. Site app should be enabled and it should have a correct backend url. e.g) localhost:8080, www.tigerstance.com
    1. Create a referral link to each user
    2. Create referral responses when users hit the link
    3. Associate a user using the session key saved in cookie when he signs up and logs in.
    4. Give bonus to the referrer and the referral
    """
    referral_sessionid = request.GET.get('referral-sessionid', '')
    if ':' in referral_sessionid:
        code, session_key = referral_sessionid.split(":")
        referral_responses = ReferralResponse.objects.filter(session_key=session_key)
        if referral_responses:  # sombody referred me
            if not referral_responses.filter(user=request.user).exists():  # first login after signup
                referral_resp = referral_responses.filter(action='RESPONDED').first()
                referral_resp.user = request.user
                referral_resp.action = 'SIGNUP'
                referral_resp.save()
                # add bonus to both the referrer and the referral
                referral_resp.referral.user.give_free_subscription(months=1)
                request.user.give_free_subscription(months=1)
                # TODO: notify user


def dict_fetch_all(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
