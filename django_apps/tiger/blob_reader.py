from tiger.core import OptionContract


def is_valid_option_response(response):
    return 'optionChain' in response and 'result' in response.get('optionChain') and len(
        response.get('optionChain').get('result')) > 0


def get_quote(response, is_yahoo):
    if is_yahoo:
        result = response.get('optionChain').get('result')[0]
        return result.get('quote')
    else:
        return response.get('underlying')


def get_expiration_timestamps(response, is_yahoo):
    if is_yahoo:
        if not is_valid_option_response(response) or not response.get('optionChain').get('result'):
            return None
        return response.get('optionChain').get('result')[0].get('expirationDates', [])
    else:
        timestamps = []
        for date_str, blob in response.get('putExpDateMap').items():
            for strike_str, contracts in blob.items():
                timestamps.append(contracts[0].get('expirationDate'))
                break
        return timestamps


def get_call_puts(ticker, response, is_yahoo, use_as_premium, expiration_timestamp=None, external_cache_id=None):
    if is_yahoo:
        if not is_valid_option_response(response):
            return None, None
        result = response.get('optionChain').get('result')[0]
        if 'options' not in result or len(result.get('options', [])) == 0:
            return None, None
        options = result.get('options')[0]

        stock_price = get_quote(response, True).get('regularMarketPrice')
        call_contracts = [OptionContract(ticker, True, row, stock_price, use_as_premium, external_cache_id) for row
                          in
                          options.get('calls', [])]
        put_contracts = [OptionContract(ticker, False, row, stock_price, use_as_premium, external_cache_id) for row
                         in
                         options.get('puts', [])]
        return call_contracts, put_contracts
    else:
        stock_price = get_quote(response, False).get('last')
        call_contracts = []
        for date_str, blob in response.get('callExpDateMap').items():
            for strike_str, contracts in blob.items():
                row = contracts[0]
                if expiration_timestamp == row.get('expirationDate'):
                    try:
                        call_contracts.append(
                            OptionContract(ticker, True, row, stock_price, use_as_premium, external_cache_id))
                    except ValueError:
                        pass
                else:
                    break
        put_contracts = []
        for date_str, blob in response.get('putExpDateMap').items():
            for strike_str, contracts in blob.items():
                row = contracts[0]
                if expiration_timestamp == row.get('expirationDate'):
                    try:
                        put_contracts.append(
                            OptionContract(ticker, False, row, stock_price, use_as_premium, external_cache_id))
                    except ValueError:
                        pass
                else:
                    break
        return call_contracts, put_contracts


def get_contract(response, is_yahoo, is_call, strike, expiration_timestamp):
    if is_yahoo:
        if not is_valid_option_response(response):
            return None
        result = response.get('optionChain').get('result')[0]
        if 'options' not in result or len(result.get('options', [])) == 0:
            return None
        options = result.get('options')[0]

        for row in options.get('calls' if is_call else 'puts', []):
            if row.get('strike') == strike and expiration == expiration_timestamp:
                return row
        return None
    else:
        for date_str, blob in response.get('callExpDateMap' if is_call else 'putExpDateMap').items():
            for strike_str, contracts in blob.items():
                contract = contracts[0]
                if contract.get('expirationDate') / 1000 == expiration_timestamp and contract.get(
                        'strikePrice') == strike:
                    return contract
        return None
