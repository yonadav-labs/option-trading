from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from tiger.core import Stock
from tiger.models import Ticker
from tiger.serializers import TickerSerializer, TickerStatsSerializer
from tiger.views.utils import get_broker


def get_annualized_value(val, days_till_expiration):
    if not days_till_expiration > 0:
        return None
    return (1 + val) ** (365.0 / days_till_expiration) - 1


class TickerViewSet(viewsets.ModelViewSet):
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

    @action(detail=True, methods=['GET'])
    def heatmap_data(self, request, *args, **kwargs):
        def build_heatmap(contracts, expirations, strikes):
            data = []

            for contract in contracts:
                apr = get_annualized_value(contract.bid / stock.stock_price, contract.days_till_expiration) \
                    if contract.is_call else get_annualized_value(contract.bid / contract.strike,
                                                                  contract.days_till_expiration)
                if apr > 10:
                    apr = None  # This will show as blank in heatmap UI.
                data.append((
                    expirations.index(contract.expiration),
                    strikes.index(contract.strike),
                    {
                        'Implied Volatility': float(
                            f'{contract.implied_volatility:.4f}') if contract.implied_volatility is not None else None,
                        'Open Interest': contract.open_interest,
                        'Volume': contract.volume,
                        'p_otm': float(f'{1 - contract.itm_probability:.4f}'),
                        'apr': float(f'{apr:.4f}') if apr is not None else None
                    }
                ))

            result = {
                'expiration_dates': expiration_dates,
                'strike_prices': [f'${strike:,.2f}' for strike in strikes],
                'data': data
            }
            return result

        ticker = self.get_object()
        quote, external_cache_id = ticker.get_quote()
        stock_price = quote.get('regularMarketPrice')  # This is from Yahoo.
        stock = Stock(ticker, stock_price, external_cache_id, ticker.get_latest_stats())

        contract_type = request.GET.get('contract_type', 'call')

        expiration_timestamps = ticker.get_expiration_timestamps()
        expirations = [ts // 1000 for ts in expiration_timestamps]
        dates = ticker.expiration_dates.filter(date__gte=timezone.now())
        expiration_dates = [date.date.strftime('%m/%d/%y') for date in dates]

        contract_lists = []

        for ts in expiration_timestamps:
            calls, puts = ticker.get_call_puts(ts)
            contract = calls if contract_type == 'call' else puts
            contract_lists += list(filter(lambda contract: contract.last_trade_date, contract))

        strikes = list(set([contract.strike for contract in contract_lists]))
        strikes.sort()

        broker = get_broker(request.user)
        broker_settings = broker.get_broker_settings()

        resp = build_heatmap(contract_lists, expirations, strikes)

        return Response(resp)
