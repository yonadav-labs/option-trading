from tiger.utils import parse_date_str_to_timestamp_with_default_tz


def get_quote(response, is_yahoo):
    if is_yahoo:
        result = response.get('optionChain').get('result')[0]
        return result.get('quote')
    else:
        return response.get('underlying')


def get_contract(response, is_call, strike, expiration_timestamp):
    if 'chain' in response:
        # Is intrinio.
        for raw_option in response.get('chain'):
            id_blob = raw_option.get('option')
            if (id_blob.get('type') == 'call') == is_call \
                    and id_blob.get('strike') == strike \
                    and parse_date_str_to_timestamp_with_default_tz(id_blob.get('expiration')) == expiration_timestamp:
                return raw_option
    else:
        # Is TD.
        for date_str, blob in response.get('callExpDateMap' if is_call else 'putExpDateMap').items():
            for strike_str, contracts in blob.items():
                contract = contracts[0]
                if contract.get('expirationDate') / 1000 == expiration_timestamp and contract.get(
                        'strikePrice') == strike:
                    return contract
    return None
