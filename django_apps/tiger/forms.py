from django import forms
from crispy_forms.helper import FormHelper


class OptionForm(forms.Form):
    target_price = forms.FloatField(label='Target price (USD)',
                                    min_value=0.0, max_value=500000.0,
                                    widget=forms.NumberInput(attrs={'placeholder': '100.0'}))
    # To be changed to drop downs
    expiration_dates = forms.MultipleChoiceField(choices=(), required=True, label='Expiration dates',
                                                 widget=forms.CheckboxSelectMultiple())
    month_to_percent_gain = forms.ChoiceField(
        choices=[(0, 'No tradeoff'),
                 (0.005, 'Trade 0.5% gain for 1 month additional expiration time'),
                 (0.01, 'Trade 1% gain for 1 month additional expiration time'),
                 (0.02, 'Trade 2% gain for 1 month additional expiration time'),
                 (0.03, 'Trade 3% gain for 1 month additional expiration time'),
                 (0.04, 'Trade 4% gain for 1 month additional expiration time'),
                 (0.05, 'Trade 5% gain for 1 month additional expiration time'),
                 (0.06, 'Trade 6% gain for 1 month additional expiration time'),
                 (0.07, 'Trade 7% gain for 1 month additional expiration time'),
                 (0.08, 'Trade 8% gain for 1 month additional expiration time'),
                 (0.09, 'Trade 9% gain for 1 month additional expiration time'),
                 (0.1, 'Trade 10% gain for 1 month additional expiration time'), ],
        required=True,
        label='Month to percentage gain tradeoff')

    def __init__(self, option_dates, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['expiration_dates'].choices = option_dates
        self.helper = FormHelper()
        self.helper.form_method = 'get'
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-2'
        self.helper.field_class = 'col-lg-8'
