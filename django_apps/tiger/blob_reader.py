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


def get_call_puts(ticker, response, expiration_timestamp=None, external_cache_id=None):
    stock_price = response.get('underlying').get('last')  # TODO: fix this.
    call_contracts = []
    for date_str, blob in response.get('callExpDateMap').items():
        for strike_str, contracts in blob.items():
            row = contracts[0]
            if expiration_timestamp == row.get('expirationDate'):
                try:
                    call_contracts.append(
                        OptionContract(ticker, True, row, stock_price, external_cache_id))
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
                        OptionContract(ticker, False, row, stock_price, external_cache_id))
                except ValueError:
                    pass
            else:
                break
    return call_contracts, put_contracts


def get_contract(response, is_call, strike, expiration_timestamp):
    for date_str, blob in response.get('callExpDateMap' if is_call else 'putExpDateMap').items():
        for strike_str, contracts in blob.items():
            contract = contracts[0]
            if contract.get('expirationDate') / 1000 == expiration_timestamp and contract.get(
                    'strikePrice') == strike:
                return contract
    return None
