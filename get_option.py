import yfinance as yf
import pandas as pd

stock = yf.Ticker("TSLA")
target_price = 650.0

all_calls = []
for expr_date in stock.options[:1]:
    option_chain = stock.option_chain(expr_date)
    calls = option_chain.calls
    calls["expireDate"] = expr_date
    all_calls.append(calls)

all_calls = pd.concat(all_calls, ignore_index=True)
all_calls.to_csv('options.csv', index=False)
