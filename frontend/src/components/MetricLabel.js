import React from 'react';
import { Tooltip } from "@material-ui/core";
import { makeStyles, withStyles } from '@material-ui/styles';
import HelpIcon from '@material-ui/icons/Help';

const CustomTooltip = withStyles((theme) => ({
    tooltip: {
        fontSize: '0.9rem',
    },
}))(Tooltip);

const useStyles = makeStyles({
    label: {
        textTransform: 'capitalize',
    },
});

const HelpTextDict = {
    '10% probability loss': { text: 'Potential loss with a 10% probability based on historical data.', hideIcon: false },
    '10% probability profit': { text: 'Potential profit with a 10% probability based on historical data.', hideIcon: false },
    '52 week range': { text: 'The high and low prices of last 52 weeks (1 year).', hideIcon: true },
    'action': { text: 'Long means buy. Short means sell.', hideIcon: true },
    'ask': { text: 'The latest price someone is willing to sell this option.', hideIcon: true },
    'ask x size': { text: 'The latest price someone is willing to sell this option and their order size.', hideIcon: true },
    'bid': { text: 'The latest price someone is willing to buy this option.', hideIcon: true },
    'bid x size': { text: 'The latest price someone is willing to buy this option and their order size.', hideIcon: true },
    'break-even at': { text: 'The stock price at which this options trade breaks even.', hideIcon: true },
    'broker': { text: 'The platform where you put orders.', hideIcon: true },
    'day range': { text: 'The lowest and highest prices of the day.', hideIcon: true },
    'day\'s change': { text: 'Price change from the market open price.', hideIcon: true },
    'delta': { text: 'Estimate of how much an option\'s value may change given a $1 move up or down in the stock price.', hideIcon: true },
    'DTE': { text: 'Days till expiration.', hideIcon: false },
    'dividend date': {
        text: 'The date on which a declared stock dividend is scheduled to be paid to eligible investors. '
            + 'Be cautious trading options around this date.', hideIcon: true
    },
    'earnings date': {
        text: 'The date of the next release of a company\'s financial report, on which the stock price could be volatile. '
            + 'Be cautious trading options around this date.', hideIcon: true
    },
    'eps': { text: 'Earnings per share.', hideIcon: true },
    'expiration': { text: 'The last date of an option contract on which the holder of the option may exercise it according to its terms.', hideIcon: true },
    'expiration date': { text: 'The last date of an option contract on which the holder of the option may exercise it according to its terms.', hideIcon: true },
    'extrinsic value': { text: 'The portion of an option price that is not intrinsic value. Often referred as time and volatility premium.', hideIcon: false },
    'gamma': { text: 'Estimate of the rate of change between an option\'s Delta and the stock\'s price.', hideIcon: true },
    'high price target': { text: 'Your expected upper bound share price of the stock on expiration day. Use with LOW PRICE TARGET to form a price target range.', hideIcon: false },
    'historical volatility': { text: 'Annualized one standard deviation of stock prices in the past that measures how much stock prices moves over a period of time.', hideIcon: true },
    'potential return': {
        text: 'Average of possible return outcomes if share price lies within the price target range on expiration date. '
            + 'Total cost is used to calculate the return rate.', hideIcon: false
    },
    'initial value': { text: 'The value of this trade when it was was saved or shared.', hideIcon: false },
    'intrinsic value': {
        text: 'The value this option will have if it was exercised today. Calculated'
            + 'by taking the difference between the market price and strike price of the underlying security.', hideIcon: false
    },
    'implied volatility': { text: 'Expected annualized volatility of a stock over the life of the option.', hideIcon: true },
    'IV': { text: 'Expected annualized volatility of a stock over the life of the option.', hideIcon: true },
    'ITM prob': { text: 'Probability of the contract to be in the money on expiration date.', hideIcon: false },
    'ITM probability': { text: 'Probability of the contract to be in the money on expiration date.', hideIcon: false },
    'latest stock return': { text: 'The latest return from the stock, for comparison of the options trade\'s return.', hideIcon: true },
    'latest return': { text: 'The latest return from the trade since the time it was saved or shared. Calculated as latest value ÷ initial value - 1.', hideIcon: true },
    'latest value': { text: 'The latest value of this trade.', hideIcon: true },
    'last': { text: 'Price from the most recent transaction.', hideIcon: true },
    'last price': { text: 'Price from the most recent transaction.', hideIcon: true },
    'last traded': { text: 'Time of most recent transaction.', hideIcon: true },
    'leverage': { text: 'Calculated as notional value ÷ total cost.', hideIcon: false },
    'market cap': { text: 'Total dollar market value of a company\'s outstanding shares of stock', hideIcon: true },
    'low price target': { text: 'Your expected lower bound share price of the stock on expiration day. Use with HIGH PRICE TARGET to form a price target range.', hideIcon: false },
    'mid/mark': { text: 'The average of the bid and ask prices.', hideIcon: true },
    'notional value': { text: 'Total value of the underlying stock this position controls.', hideIcon: false },
    'open interest': { text: 'The number of active contracts that are not closed or exercised. An indicator for market liquidity.', hideIcon: true },
    'OI': { text: 'The number of active contracts that are not closed or exercised. An indicator for market liquidity.', hideIcon: true },
    'min open interest': { text: 'The number of active contracts that are not closed or exercised. An indicator for market liquidity.', hideIcon: true },
    'p/e ratio': { text: 'The price to earnings ratio.', hideIcon: true },
    'premium price to use': {
        text: 'The options price to use in return calculation.'
            + 'Market price: use bid price of options contracts for sell, use ask price for buy. '
            + 'Mid/Mark price: use the mid/mark price of options contracts.', hideIcon: false
    },
    'probability of profit': { text: 'Chance of making at least $0.01 on a trade. Implied by option price.', hideIcon: false },
    'max profit': { text: 'The highest possible return of this trade.', hideIcon: true },
    'max loss': { text: 'The lowest possible return of this trade.', hideIcon: true },
    'order net debit': { text: 'The cost to open position for this strategy per contract/spread. Commission cost not included.', hideIcon: true },
    'order net credit': { text: 'The initial payback received to open position for this strategy per contract/spread. This is not profit.', hideIcon: true },
    'quoted at': { text: 'When the market data was quoted. There may be a delay on our data v.s. market.', hideIcon: true },
    'rho': { text: 'Estimate of an option\'s sensitivity to changes in the risk-free rate of interest.', hideIcon: true },
    'strategy': {
        text: 'Option strategies are the simultaneous and mixed, buying or selling of one or more options in order '
            + 'to create trading opportunities with unique risk/reward characters.', hideIcon: true
    },
    'strike': { text: 'A fixed price at which the owner of the option can buy, or sell, the stock.', hideIcon: true },
    'price target': {
        text: 'Your expected price target of the stock shares on selected expiration date. '
            + 'Our algorithm finds strategies with the highest potential return for that price target.', hideIcon: false
    },
    'price target on exp day': {
        text: 'Your expected price target of the stock shares on selected expiration date. '
            + 'Our algorithm finds strategies with the highest potential return for that price target.', hideIcon: false
    },
    'price target range': { text: 'Your expected lower and upper bound share price of the stock on expiration date.', hideIcon: false },
    'theta': { text: 'Estimate of how much an option\'s premium may decay each day with all other factors remaining the same.', hideIcon: true },
    'ticker': { text: 'An abbreviation used to identify a particular stock. For example: {text: AAPL stands for Apple Inc.', hideIcon: true },
    'ticker symbol': { text: 'An abbreviation used to identify a particular stock. For example: {text: AAPL stands for Apple Inc.', hideIcon: true },
    'to expiration': { text: 'Number of days till the option\'s expiration date, including non-trading days.', hideIcon: true },
    'total commission': { text: 'Total cost paid to the trading platform to open and close this position.', hideIcon: false },
    'total cost': {
        text: 'The total capital required to enter this trade, including commission cost and collateral if applicable. ' +
            'Can also be considered as the value of this position.', hideIcon: false
    },
    'vega': { text: 'Estimate of change in an option premium based on a 1% change in implied volatility', hideIcon: true },
    'volume': { text: 'Total number of option contracts transacted for the day. An indicator for market liquidity.', hideIcon: true },
    'VOL': { text: 'Total number of option contracts transacted for the day. An indicator for market liquidity.', hideIcon: true },
    'VOL/OI': { text: 'Volume as a percentage of open interest.', hideIcon: true },
    'min volume': { text: 'Total number of option contracts transacted for the day. An indicator for market liquidity.', hideIcon: true },
};

export default function MetricLabel(props) {
    let { label, helpText } = props;
    let hideIcon = true;
    const classes = useStyles();

    if (!helpText) {
        helpText = label in HelpTextDict ? HelpTextDict[label].text : '';
        hideIcon = label in HelpTextDict ? HelpTextDict[label].hideIcon : true;
    }

    if (helpText) {
        if (hideIcon) {
            return (
                <span className={classes.label}>
                    <CustomTooltip
                        title={helpText}
                        placement="right-start"
                        enterTouchDelay={0}
                        arrow
                    >
                        <span>{label}</span>
                    </CustomTooltip>
                </span>
            );
        }
        return (
            <span className={classes.label}>
                {label}
                <CustomTooltip
                    title={helpText}
                    placement="right-start"
                    enterTouchDelay={0}
                    arrow
                >
                    <HelpIcon fontSize="small" color="action" />
                </CustomTooltip>
            </span>
        );
    } else {
        return (
            (
                <span className={classes.label}>
                    {label}
                </span>
            )
        );
    }
}