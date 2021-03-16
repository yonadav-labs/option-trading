def is_low_liquidity(contract):
    return contract.open_interest < 10 or contract.volume == 0

def filter_contract_on_attribute(contract, filter_key, filter_value):
    """
    filter contract on an attribute by value. 
    If an invalid filter key or no filter value is passed, the filter is ignored by returning true.

    Parameters:
        contract (OptionContract): An option contract object
        filter_key (str): A string comprised of <operator>_<attribute>
        filter_value (any): A value to filter by

    Returns:
        (boolean): Boolean value representing if contract satisfies filter conditions
    """
    
    assert isinstance(filter_key, str), 'invalid filter_key: not string'
    tokens = filter_key.split('.', 1)
    assert len(tokens) == 2, 'invalid filter_key: malformatted'
    operator = tokens[0]
    attribute = tokens[1]

    if hasattr(contract, attribute):
        if operator == 'eq':
            return getattr(contract, attribute) == filter_value
        elif operator == 'max':
            assert(type(filter_value) is float or type(filter_value) is int), 'invalid filter_value: not a float or int'
            return getattr(contract, attribute) <= filter_value
        elif operator == 'min':
            assert(type(filter_value) is float or type(filter_value) is int), 'invalid filter_value: not a float or int'
            return getattr(contract, attribute) >= filter_value
    
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
                calls = list(filter(lambda call: filter_contract_on_attribute(call, key, value), calls))
                puts = list(filter(lambda put: filter_contract_on_attribute(put, key, value), puts))

        # filter out inactive contracts.
        call_lists.append(list(filter(lambda call: call.last_trade_date, calls)))
        put_lists.append(list(filter(lambda put: put.last_trade_date, puts)))
    return call_lists, put_lists
