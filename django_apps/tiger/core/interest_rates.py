import datetime
import requests

from datetime import timedelta
from lxml import etree

# Some background:
# In theory, r is a short-term safe interest rate, and it is constant through time though the theory does goes through with r¯ (average r from t to T) in place or r. 
# In practice, you take the continuously compounded yield on a T-bill of maturity closest to that of your option. 
# Eurocurrency rates work too, especially for currency options. 
# In theory, you should choose whether to use a LIBOR or LIBID rate depending 
# upon whether the option dealer who delta hedges your trade is going to be borrowing money (at the LIBOR rate) or lending money (at the LIBID rate).
# Source: Basic Black-Scholes: Option Pricing and Trading (2'nd edition) by Timothy Falcon Crack, p. 143.

# The above advice used to be standard practice, as mentioned, but is slowly being replaced by SOFR.
# Thus we quote the risk free rate (rfr) as the sofr rate.


# Fetch the latest risk free rates, Secured Overnight Financing Rates from the New York Federal Reserve
# Source: https://www.newyorkfed.org/markets/reference-rates/sofr-averages-and-index
# We fetch the XML here directly from the Reserve and parse it


# Fetch the dataframe of SOFR rates from XML
def fetch_sofr_data():

    # Percentile XML to SQL mappings
    percentile_map = {
        'percentPercentile1': 'pctl_1',
        'percentPercentile25': 'pctl_25',
        'percentRate': 'pctl_50',
        'percentPercentile75': 'pctl_75',
        'percentPercentile99': 'pctl_99'
    }

    # Averages and Index XML to SQL mappings
    avgs_map = {
        'average30day': 'avg_30d',
        'average90day': 'avg_90d',
        'average180day': 'avg_180d',
        'index': 'sofr_index'
    }

    # XML URLs
    rates_url = "https://markets.newyorkfed.org/read?productCode=50&eventCodes=520&limit=25&startPosition=0&sort=postDt:-1&format=xml"
    avgs_url = "https://markets.newyorkfed.org/read?productCode=50&eventCodes=525&limit=25&startPosition=0&sort=postDt:-1&format=xml"

    # Dict to store our data in
    datastore = {}

    # Use this list to iterate over rates, then averages,
    # by pairing the url with its associated mapping
    iter_list = [
        [rates_url, percentile_map],
        [avgs_url, avgs_map]
    ]

    for url, mapping in iter_list:
        res = requests.get(url)

        # Fix for LXML not parsing the response properly
        xml = bytes(bytearray(res.text, encoding='utf-8'))

        # The response has a root, then two sections:
        # A header and the dataset. We split those here.
        root = etree.fromstring(xml)
        dataset = root.getchildren()[0]

        # There are groups of Rates in the dataset
        for child in dataset.getchildren():
            if child.tag == 'rate':

                # For each observation in the Series, extract the tag describing the content of the Rate and its observations
                for obs in child.getchildren():
                    if obs.tag == 'effectiveDate':
                        date = obs.text

                        # If we haven't seen this date yet, create an empty dict to store data for that date
                        if date not in datastore:
                            datastore[date] = {}
                    
                    elif obs.tag in mapping:
                        datastore[date][mapping[obs.tag]] = obs.text

    # Finally, we unpack the dict, storing the date, and 
    # type of data + the observed value for that date

    # We use this list to store our rows
    final_list = []

    # For each date we saw
    for date, dt_dict in datastore.items():

        # Begin by adding the date to the current row, as a datetime object
        dt_obj = datetime.datetime.strptime(date, '%Y-%m-%d')
        row_list = [dt_obj]

        # If a value doesn't exist for the date, skip the whole date
        try:
            # For each map, 
            for mapping in [percentile_map, avgs_map]:
                # For each mapped value in the map
                for map_val in mapping.values():
                    # Add the observed value for that mapped value for the date
                    row_list.append(dt_dict[map_val])

            # Add the row when done to our final list
            final_list.append(row_list)
        except:
            print("Missing values for date {}".format(date))

    # Return the list
    return final_list


# Calculate a projected annualized risk free rate compounded daily
# Weighting methodology from:
# https://www.newyorkfed.org/markets/reference-rates/additional-information-about-reference-rates#tgcr_bgcr_sofr_calculation_methodology
def annualize_daily_rate(rate):
    # From the methodology:
    # The SOFR Averages and Index employ daily compounding on each business day. 
    # On any day that is not a business day, simple interest applies, at a rate of interest equal to the SOFR value for the preceding business day. 
    # In accordance with broader U.S. dollar money market convention, interest is calculated using the actual number of calendar days, but assuming a 360-day year.

    # A decent approximation is employing the same method they use for averages, but compounding for all days. 
    # Can make this take into account non-trading day simple interest, but the effect is minimal.

    # The data is presented in terms of %, so we divide by 100
    # E.g. a listed rate of 1.8% would be represented as 0.018, a rate of 0.01% would be represented as 0.0001
    # We also divide by 360 as it's the annualized rate which is published.
    rate = float(rate)/100/360 
    return (((1+rate)**(360))-1)*100


# Can make this take a custom duration and compute average back as well.
def get_rfr(duration):
    # Mapping for the desired duration to the index in the return list
    duration_map = {
        'pctl1': 1,
        'pctl25': 2,
        'pctl50': 3,
        'pctl75': 4,
        'pctl99': 5,
        '30': 6,
        '90': 7,
        '180': 8
    }
    # Map the desired index
    duration_index = duration_map[duration]

    # Fetch rates data
    rates = fetch_sofr_data()

    # Get target rate from mapped index in most recent data
    target_rate = rates[0][duration_index]

    # Return with compounding, daily
    return annualize_daily_rate(target_rate)
