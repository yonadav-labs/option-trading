import math

from interest_rates import get_rfr


# Multiple methods to do this
# Here we're taking the risk free rate, number of dividends per year, 
# the current price, and the value of the next dividend
def get_implied_yield(r, divs_per_year, cur_price, next_div):
    # We define our trading days, the number of days to compound the rate, and the rate itself
    # (as we are targeting the risk free rate between each dividend)
    trading_days = 252
    compound_days = trading_days/divs_per_year
    qr = ((1+(r/trading_days))**(compound_days))-1

    # Then we sum each discrete dividend and discount it backwards appropriately, 
    # for the number of periods it is away from now based on the period risk-free rate
    div_sum = 0
    for i in range(1,divs_per_year+1):
        div_sum += (math.exp(-qr*i))*next_div

    # We then get a solution for the period dividend rate
    implied_div_yield = (-1/divs_per_year)*(math.log(1-((1/cur_price)*div_sum)))

    # Compound it by the number of periods in the year and return the
    # proper implied continuous dividend yield
    return ((1+(implied_div_yield))**divs_per_year)-1


# Simple method to get the realized dividend yield given
# the past year of dividends and the current price
def get_realized_div_yield(past_12, cur_price):
    return math.log(1+(past_12/cur_price))


# Returns a list of [realized dividend yield, implied dividend yield]
def get_div_yield(ttm_div_amount, next_div_amount, dividends_per_year, current_price):
    # Will need to fill these from a Stock object

    # Pull the interest rate
    rfr = get_rfr('30') # 30-day average chosen, any of them are fine. Can add in a parameter to specify duration.

    # Get realized div yield
    realized_div_yield = get_realized_div_yield(ttm_div_amount, current_price)

    # Get implied dividend yield
    implied_div_yield = get_implied_yield(rfr, dividends_per_year, current_price, next_div_amount)

    return [realized_div_yield, implied_div_yield]