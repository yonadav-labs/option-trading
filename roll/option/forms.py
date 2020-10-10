from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit


class TickerFrom(forms.Form):
    ticker = forms.CharField(label='Ticker', max_length=10)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'get'
        self.helper.form_action = 'ticker'
        self.helper.add_input(Submit('submit', 'Submit'))


class OptionForm(forms.Form):
    ticker = forms.CharField(label='Ticker', max_length=10)
    target_price = forms.FloatField(label='Target price')
    # To be changed to drop downs
    expiration_date_start = forms.DateTimeField(label='Expiration date start')
    expiration_date_end = forms.DateTimeField(label='Expiration date end')
    month_to_percent_gain = forms.FloatField(label='Month to percentage gain tradeoff', min_value=0.0, max_value=25.0)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'get'
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-2'
        self.helper.field_class = 'col-lg-8'
