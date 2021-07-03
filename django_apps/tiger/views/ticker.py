from django.db import connection
from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_tracking.mixins import LoggingMixin
from tiger.core import Stock
from tiger.models import Ticker
from tiger.serializers import TickerSerializer, TickerStatsSerializer
from tiger.utils import timestamp_to_datetime_with_default_tz
from tiger.views.utils import dict_fetch_all, get_valid_contracts


def get_annualized_value(val, days_till_expiration):
    if not days_till_expiration > 0:
        return None
    return (1 + val) ** (365.0 / days_till_expiration) - 1


class TickerViewSet(LoggingMixin, viewsets.ModelViewSet):
    serializer_class = TickerSerializer
    lookup_field = 'symbol'
    watchlist_name = 'recent'

    def get_queryset(self):
        user = self.request.user
        queryset = Ticker.objects.filter(status="unspecified").order_by('symbol')

        if user.is_authenticated and self.action == 'list':
            watchlist, _ = user.watchlists.get_or_create(name=self.watchlist_name)
            watch_items = watchlist.watchlist_items.all().order_by('-last_updated_time')
            watch_tickers = [ii.ticker for ii in watch_items]
            watch_tickers_ids = [ii.id for ii in watch_tickers]
            rest_tickers = [ii for ii in queryset if ii.id not in watch_tickers_ids]
            queryset = watch_tickers + rest_tickers

        return queryset

    @action(detail=False, methods=['GET'])
    def popular(self, request, *args, **kwargs):
        most_saved_tickers = Ticker.objects.filter(status='unspecified').annotate(
            num_watchlistitem=Count('watchlistitem')).order_by('-num_watchlistitem')[:4]
        result = TickerSerializer(most_saved_tickers, many=True).data
        return Response(result)

    @action(detail=False, methods=['GET'])
    def top_movers(self, request, *args, **kwargs):
        sql_query = """
                    SELECT ticker_id FROM	
                    (
                        SELECT ticker_id, price_close, price_open, created_time, 
                        rank() OVER (PARTITION BY ticker_id ORDER BY created_time DESC) 
                        FROM public.tiger_tickerstats
                        WHERE price_close IS NOT NULL 
                        AND price_open IS NOT NULL
                    ) tickerstats
                    JOIN public.tiger_ticker t ON t.id = tickerstats.ticker_id
                    WHERE rank = 1 
                    AND t.status = 'unspecified'
                    ORDER BY (price_close - price_open) / price_open DESC
                    LIMIT 12;
                """
        top_mover_ticker_id_results = []
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            top_mover_ticker_id_results = dict_fetch_all(cursor)

        top_mover_ticker_ids = [top_mover_ticker_id_result['ticker_id'] for top_mover_ticker_id_result in
                                top_mover_ticker_id_results]
        top_mover_tickers = Ticker.objects.filter(pk__in=top_mover_ticker_ids)
        result = TickerSerializer(top_mover_tickers, many=True).data
        return Response(result)

    @action(detail=True, methods=['GET'])
    def expire_dates(self, request, *args, **kwargs):
        ticker = self.get_object()

        if request.user.is_authenticated:
            request.user.add_ticker_to_watchlist(self.watchlist_name, ticker)

        expiration_timestamps = ticker.get_expiration_timestamps()

        if expiration_timestamps is None:
            return Response('No expiration timestamp is available', status=500)

        quote, external_cache_id = ticker.get_quote()
        resp = {
            'quote': quote,
            'expiration_timestamps': expiration_timestamps,
            'external_cache_id': external_cache_id,
            'ticker_stats': TickerStatsSerializer(ticker.get_latest_stats()).data,
        }

        return Response(resp)

    @action(detail=True, methods=['POST'])
    def heatmap_data(self, request, *args, **kwargs):
        def build_heatmap(contracts, expirations, strikes):
            data = [[None] * len(expirations) for ii in range(len(strikes))]

            lst_implied_volatility = []
            lst_open_interest = []
            lst_volume = []
            lst_p_otm = []
            lst_apr = []
            lst_vol_per_oi = []

            for contract in contracts:
                apr = get_annualized_value(contract.bid / stock.stock_price, contract.days_till_expiration) \
                    if contract.is_call else get_annualized_value(contract.bid / contract.strike,
                                                                  contract.days_till_expiration)
                if apr and apr > 10:
                    apr = None  # This will show as blank in heatmap UI.

                vol_per_oi = None
                if contract.volume is not None and contract.open_interest:
                    vol_per_oi = contract.volume / contract.open_interest

                x_idx = strikes.index(contract.strike)
                y_idx = expirations.index(contract.expiration)

                data[x_idx][y_idx] = {
                    'Implied Volatility': float(
                        f'{contract.implied_volatility:.4f}') if contract.implied_volatility is not None else None,
                    'Open Interest': contract.open_interest,
                    'Volume': contract.volume,
                    'p_otm': float(
                        f'{1 - contract.itm_probability:.4f}') if contract.itm_probability is not None else None,
                    'apr': float(f'{apr:.4f}') if apr is not None else None,
                    'vol_per_oi': float(f'{vol_per_oi:.4f}') if vol_per_oi is not None else None
                }

                if contract.implied_volatility is not None:
                    lst_implied_volatility.append(contract.implied_volatility)
                if contract.open_interest is not None:
                    lst_open_interest.append(contract.open_interest)
                if contract.volume is not None:
                    lst_volume.append(contract.volume)
                if contract.itm_probability is not None:
                    lst_p_otm.append(1 - contract.itm_probability)
                if apr is not None:
                    lst_apr.append(apr)
                if vol_per_oi is not None:
                    lst_vol_per_oi.append(vol_per_oi)

            min_max = {
                'Implied Volatility': {
                    'min': min(lst_implied_volatility),
                    'max': max(lst_implied_volatility)
                },
                'Open Interest': {
                    'min': min(lst_open_interest),
                    'max': max(lst_open_interest)
                },
                'Volume': {
                    'min': min(lst_volume),
                    'max': max(lst_volume)
                },
                'p_otm': {
                    'min': min(lst_p_otm),
                    'max': max(lst_p_otm)
                },
                'apr': {
                    'min': min(lst_apr),
                    'max': max(lst_apr)
                },
                'vol_per_oi': {
                    'min': min(lst_vol_per_oi),
                    'max': max(lst_vol_per_oi)
                },
            }

            result = {
                'expiration_dates': expiration_dates,
                'strike_prices': [f'${strike:,.2f}' for strike in strikes],
                'values': data,
                'min_max': min_max
            }

            return result

        ticker = self.get_object()
        quote, external_cache_id = ticker.get_quote()
        stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
        stock = Stock(ticker, stock_price, external_cache_id, ticker.get_latest_stats())

        filters = request.data.get('filters')

        expiration_timestamps = ticker.get_expiration_timestamps()
        expirations = [ts // 1000 for ts in request.data.get('expiration_timestamps')]

        expiration_dates = [timestamp_to_datetime_with_default_tz(ts).strftime("%b %d, %y")
                            for ts in expirations]

        call_contract_lists, put_contract_list = get_valid_contracts(ticker, request, expiration_timestamps, False, filters)
        contract_lists = call_contract_lists if filters.get('eq.is_call') else put_contract_list
        contract_lists = sum(contract_lists, [])

        strikes = list(set([contract.strike for contract in contract_lists]))
        strikes.sort()

        resp = build_heatmap(contract_lists, expirations, strikes)

        return Response(resp)
