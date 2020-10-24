def get_raw_calls(yh_ticker, expiration_date_str):
    yh_ticker.options  # Initialize.
    internal_date = yh_ticker._expirations[expiration_date_str]
    options = yh_ticker._download_options(internal_date)
    return options.get('calls')


'''
import yfinance as yf

stock = yf.Ticker('TSLA')
print(get_raw_calls(stock, '2021-06-17'))
'''
