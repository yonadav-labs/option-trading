import React from 'react';
import { Tooltip } from "@material-ui/core";
import { makeStyles, withStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
    label: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

const CustomTooltip = withStyles((theme) => ({
    tooltip: {
        fontSize: '0.8rem',
    },
}))(Tooltip);

const HelpTextDict = {
    '52 week range': 'The high and low prices of last 52 weeks (1 year).',
    'action': 'Long means buy. Short means sell.',
    'ask': 'The latest price someone is willing to sell this option.',
    'ask x size': 'The latest price someone is willing to sell this option and their order size.',
    'bid': 'The latest price someone is willing to buy this option.',
    'bid x size': 'The latest price someone is willing to buy this option and their order size.',
    'break-even at': 'The stock price at which this options trade breaks even.',
    'broker': 'The platform where you put orders.',
    'cost': 'The total capital required to enter this trade, including collateral if applicable. Can also be considered as the value of this postition.',
    'day range': 'The lowest and highest prices of the day.',
    'day\'s change': 'Price change from the market open price.',
    'delta': 'Estimate of how much an option\'s value may change given a $1 move up or down in the stock price.',
    'dividend date': 'The date on which a declared stock dividend is scheduled to be paid to eligible investors. '
        + 'Be cautious trading options around this date.',
    'earnings date': 'The date of the next release of a company\'s financial report, on which the stock price could be volatile. '
        + 'Be cautious trading options around this date.',
    'eps': 'Earnings per share.',
    'expiration': 'The last date of an option contract on which the holder of the option may exercise it according to its terms.',
    'expiration date': 'The last date of an option contract on which the holder of the option may exercise it according to its terms.',
    'gamma': 'Estimate of the rate of change between an option\'s Delta and the stock\'s price',
    'hypothetical profit': 'Average of possible profit outcomes if share price lies within the target price range on expiration date.',
    'initial value': 'The value of this trade when it was was saved or shared.',
    'implied volatility': 'Expected annualized volatility of a stock over the life of the option.',
    'latest stock return': 'The latest return from the stock, for comparison of the options trade\'s return.',
    'latest return': 'The latest return from the trade since the time it was saved or shared. Calculated as latest value ÷ initial value - 1.',
    'latest value': 'The latest value of this trade.',
    'last': 'Pirce from the most recent transaction.',
    'last price': 'Pirce from the most recent transaction.',
    'last traded': 'Time of most recent transaction.',
    'leverage': 'Calculated as notional value ÷ postition cost.',
    'market cap': 'Total dollar market value of a company\'s outstanding shares of stock',
    'mid/mark': 'The average of the bid and ask prices.',
    'net debit': 'The cost to open position for this strategy per contract/spread. Commission cost not included.',
    'net credit': 'The initial payback recieved to open position for this strategy per contract/spread. This is not profit.',
    'notional value': 'Total value of the underlying stock this postition controls.',
    'commission cost': 'Cost paid to the trading platform to open/close 1 options contract. This is factored in the position cost.',
    'open interest': 'The number of active contracts that are not closed or exercised. An indicator for market liquidity.',
    'p/e ratio': 'The price to earnings ratio.',
    'premium price to use': 'The options price to use in return calculation.'
        + 'Market price: use bid price of options contracts for sell, use ask price for buy. '
        + 'Mid/Mark price: use the mid/mark price of options contracts.',
    'profit limit': 'The highest possible return of this trade.',
    'quoted at': 'When the market data was quoted. There may be a delay on our data v.s. market.',
    'rho': 'Estimate of an option\'s sensitivity to changes in the risk-free rate of interest.',
    'strategy': 'Option strategies are the simultaneous and mixed, buying or selling of one or more options in order '
        + 'to create trading opportunities with unique risk/reward characters.',
    'strike': 'A fixed price at which the owner of the option can buy, or sell, the stock.',
    'target price range': 'Your expected lower and upper bound share price of the stock on expiration day.',
    'theta': 'Estimate of how much an option\'s premium may decay each day with all other factors remaining the same.',
    'ticker': 'An abbreviation used to identify a particular stock. For example: AAPL stands for Apple Inc.',
    'to expiration': 'Number of days till the option\'s expiration date, including non-trading days.',
    'vega': 'Estimate of change in an option premium based on a 1% change in implied volatility',
    'volume': 'Total number of option contracts transacted for the day. An indicator for market liquidity.',
}

export default function MetricLabel(props) {
    let { label, helpText } = props;
    const classes = useStyles();

    if (!helpText) {
        helpText = HelpTextDict[label.toLowerCase()];
    }

    if (helpText) {
        return (
            (
                <>
                    <CustomTooltip title={helpText} placement="right-start" arrow>
                        <span className={classes.label}>{label}</span>
                    </CustomTooltip>
                    <br />
                </>
            )
        );
    } else {
        return (
            (
                <>
                    <span className={classes.label}>{label}</span>
                    <br />
                </>
            )
        );
    }
}