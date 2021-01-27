def is_low_liquidity(contract):
    return contract.open_interest < 10 or contract.volume == 0


def get_valid_contracts(ticker, request, use_as_premium, all_expiration_timestamps, filter_low_liquidity=False):
    input_expiration_timestamps = set([int(ts) for ts in request.query_params.getlist('expiration_timestamps') if
                                       int(ts) in all_expiration_timestamps])
    call_lists = []
    put_lists = []
    for ts in input_expiration_timestamps:
        calls, puts = ticker.get_call_puts(use_as_premium, ts)
        if filter_low_liquidity:
            calls = filter(lambda call: not is_low_liquidity(call), calls)
            puts = filter(lambda put: not is_low_liquidity(put), puts)
        # filter out inactive contracts.
        call_lists.append(list(filter(lambda call: call.last_trade_date, calls)))
        put_lists.append(list(filter(lambda put: put.last_trade_date, puts)))
    return call_lists, put_lists
