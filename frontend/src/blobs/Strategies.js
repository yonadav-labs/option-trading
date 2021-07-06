/* eslint-disable no-multi-str */
class Leg {
    type = "";

    constructor(type) {
        this.type = type;
    }
}

class CashLeg extends Leg {
    value = 0;

    constructor(data) {
        super("cash");
        Object.assign(this, data);
    }
}

class StockLeg extends Leg {
    shares = 0;

    constructor(data) {
        super("stock");
        Object.assign(this, data);
    }
}

class OptionLeg extends Leg {
    expiration = null;
    action = ""; // is_long
    optionType = ""; // is_call boolean
    contract = {}; // contract
    strike = 0;
    units = 1;

    constructor(data) {
        super("option");
        Object.assign(this, data);
    }
}

class Strategy {
    id = "";
    name = "";
    description = "";
    sentiment = [];
    linkedProperties = [];
    legs = [];
    rules = []; // array of rules where rule in this format: {<leg_index>, <leg_property>, <operator>, <leg_index>} e.g. {0, "contract.strike", ">", 1}
    relationships = [];

    constructor(data) {
        Object.assign(this, data);
        // TODO hash strategy settings to help identify it
        this.id = this.name.toLowerCase().replace(/\s+/g, '_');
    }
}

class Rule {
    legAIndex = 0;
    legAProperty = '';
    operator = '';
    legBIndex = 0;
    legBProperty = '';

    constructor(legAIndex, legAProperty, operator, legBIndex, legBProperty) {
        this.legAIndex = legAIndex;
        this.legAProperty = legAProperty;
        this.operator = operator;
        this.legBIndex = legBIndex;
        this.legBProperty = legBProperty;
    }
}

class Relation {
    legAIndex = 0;
    legAProperty = '';
    operator = '';
    legBIndex = 0;
    legBProperty = '';
    legBPropertyDefaultVal = null;
    legCIndex = 0;
    legCProperty = '';
    legCPropertyDefaultVal = null;

    constructor(legAIndex, legAProperty, operator, legBIndex, legBProperty, legBPropertyDefaultVal, legCIndex, legCProperty, legCPropertyDefaultVal) {
        this.legAIndex = legAIndex;
        this.legAProperty = legAProperty;
        this.operator = operator;
        this.legBIndex = legBIndex;
        this.legBProperty = legBProperty;
        this.legBPropertyDefaultVal = legBPropertyDefaultVal;
        this.legCIndex = legCIndex;
        this.legCProperty = legCProperty;
        this.legCPropertyDefaultVal = legCPropertyDefaultVal;
    }

}

export const strategies = [
    new Strategy(
        {
            name: "Long Call",
            type: "long_call",
            description: "Pay a premium to have the option to buy shares of the stock at the strike price until the expiration. \
                            You profit when the stock price moves above the: strike price + the premium.",
            sentiment: ["bullish"],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Covered Call",
            type: "covered_call",
            description: "Receive a premium to allow your shares of the stock to be sold at the strike price until the expiration. \
                            You profit when the stock price does not move below the: strike price - the premium.",
            sentiment: ["bearish", "neutral"],
            legs: [
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new StockLeg(
                    {
                        action: "long",
                        ticker: "",
                        shares: 100
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Protective Put",
            type: "protective_put",
            description: "Pay a premium to allow your shares of the stock to be sold at the strike price until the expiration. \
                            You profit when the stock price does not move below the: stock price - strike price + the premium.",
            sentiment: ["bullish"],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new StockLeg(
                    {
                        action: "long",
                        ticker: "",
                        shares: 100
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Long Put",
            type: "long_put",
            description: "Pay a premium to have the option to sell shares of the stock at the strike price until the expiration. \
                            You profit when the stock price does not move below the: strike price + the premium.",
            sentiment: ["bearish", "volatile"],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Cash Secured Put",
            type: "cash_secured_put",
            description: "Receive a premium to allow your cash to be exchanged for shares of the stock at the strike price until the expiration. \
                            You profit when the stock price does not move below: the strike price - the premium.",
            sentiment: ["bullish", "neutral"],
            relationships: [new Relation(1, "value", "*", 0, "contract.strike", null, null, null, 100)],
            legs: [
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new CashLeg(
                    {
                        value: 0
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Bull Call Spread",
            type: "bull_call_spread",
            description: "Pay a premium for buying a call and selling a call at a strike higher than from the call you bought. \
                            You profit when the stock price moves above the: strike of the call that you bought + (premium of the call you bought - premium of the call you sold).",
            sentiment: ["bullish"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", "<", 1, "contract.strike")],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Bear Call Spread",
            type: "bear_call_spread",
            description: "Receive a premium from buying a call and selling a call at a strike lower than from the call you bought. \
                            You profit when the stock price moves below the: strike price of the call you sold + (premium of the call you sold - premium of the call you bought).",
            sentiment: ["bearish", "neutral"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", ">", 1, "contract.strike")],
            relationships: [
                new Relation(2, "value", "-", 0, "contract.strike", null, 1, "contract.strike", null),
                new Relation(2, "value", "*", 2, "value", null, null, null, 100)
            ],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new CashLeg(
                    {
                        value: 0
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Bear Put Spread",
            type: "bear_put_spread",
            description: "Pay a premium for buying a put and selling a put at a strike lower than from the put you bought. \
                            You profit when the stock price moves below the: strike of the put you bought - (premium of the put you bought - premium of the put you sold).",
            sentiment: ["bearish"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", ">", 1, "contract.strike")],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Bull Put Spread",
            type: "bull_put_spread",
            description: "Receive a premium from buying a put and selling a put at a strike higher than from the put you bought. \
                            You profit when the stock price moves above the: strike of the put you sold - (premium of the put you sold - premium of the put you bought).",
            sentiment: ["bullish", "neutral"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", "<", 1, "contract.strike")],
            relationships: [
                new Relation(2, "value", "-", 1, "contract.strike", null, 0, "contract.strike", null),
                new Relation(2, "value", "*", 2, "value", null, null, null, 100)
            ],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new CashLeg(
                    {
                        value: 0
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Long Straddle",
            type: "long_straddle",
            description: "A basic strategy that profits when the stock price moves drastically up or down. \
                            Pay a premium to buy a call and a put at the same strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["volatile"],
            linkedProperties: ["expiration", "strike"],
            rules: [],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Long Strangle",
            type: "long_strangle",
            description: "A basic strategy that profits when the stock price moves drastically up or down. \
                            Pay a premium to buy a call and a put; With the call strike being higher than the put strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["volatile"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "strike", ">", 1, "strike")],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "basic",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Iron Condor",
            type: "iron_condor",
            description: "A strategy that profits when the stock price only moves a little. \
                            Receive a premium after buying a call and selling a call at lower strike, buying a put and selling a put at a lower strike. \
                            You profit when the stock price stays within the range: strike of put you sold - premium received < stock price < strike of call sold + premium received \
                            Depending on which direction the stock goes, losses are capped at: \
                            difference between the strikes of the calls - premium received OR difference between the strikes of the puts - premium received.",
            sentiment: ["neutral"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", ">", 1, "contract.strike"),
            new Rule(2, "contract.strike", "<", 3, "contract.strike"),
            new Rule(0, "contract.strike", ">", 0, "contract.stock_price"),
            new Rule(1, "contract.strike", ">", 1, "contract.stock_price"),
            new Rule(2, "contract.strike", "<", 2, "contract.stock_price"),
            new Rule(3, "contract.strike", "<", 3, "contract.stock_price")],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "advanced",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Iron Butterfly",
            type: "iron_butterfly",
            description: "A strategy that profits when the stock price does not move much. \
                            Receive a premium after selling a call and buying a call at a higher strike, selling a put and buying a put at a lower strike. \
                            You profit when the stock price stays within the range: strike of put you sold + premium received < stock price < strike of call sold - premium received \
                            Depending on which direction the stock goes, losses are capped at: \
                            difference between the strikes of the calls - premium received OR difference between the strikes of the puts - premium received.",
            sentiment: ["neutral"],
            linkedProperties: ["expiration"],
            rules: [
                new Rule(1, "contract.strike", "==", 3, "contract.strike"),
                new Rule(2, "contract.strike", "<", 3, "contract.strike"),
                new Rule(0, "contract.strike", ">", 1, "contract.strike")
            ],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Short Strangle",
            type: "short_strangle",
            description: "A strategy that profits when the stock price does not move much. \
                            Receive a premium to sell a call and a put; With the call strike being higher than the put strike. \
                            You profit when the stock price stays within this range: strike - premium > stock price > strike + premium \
                            There is no limit to how much you can lose with this strategy.",
            sentiment: ["neutral", "volatile"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "strike", ">", 1, "strike")],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "advanced",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: true
        }
    ),
    new Strategy(
        {
            name: "Short Straddle",
            type: "short_straddle",
            description: "A strategy that profits when the stock price does not move much. \
                            Receive a premium to sell a call and a put at the same strike. \
                            You profit when the stock price stays within this range: strike - premium > stock price > strike + premium \
                            There is no limit to how much you can lose with this strategy.",
            sentiment: ["neutral", "volatile"],
            linkedProperties: ["expiration", "strike"],
            rules: [],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "advanced",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: true
        }
    ),
    new Strategy(
        {
            name: "Long Butterfly Spread",
            type: "long_butterfly_spread",
            description: "A basic strategy that profits when the stock price moves drastically up or down. \
                            Pay a premium to buy a call and a put at the same strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["neutral"],
            linkedProperties: ["expiration", "optionType"],
            rules: [
                new Rule(0, "contract.strike", "<", 1, "contract.strike"),
                new Rule(1, "contract.strike", "<", 2, "contract.strike")
            ],
            relationships: [new Relation(1, "units", "*", 0, "units", null, null, null, 2)],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Short Butterfly Spread",
            type: "short_butterfly_spread",
            description: "A basic strategy that profits when the stock price moves drastically up or down. \
                            Pay a premium to buy a put and a call at the same strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["neutral"],
            linkedProperties: ["expiration", "optionType"],
            rules: [
                new Rule(0, "contract.strike", "<", 1, "contract.strike"),
                new Rule(1, "contract.strike", "<", 2, "contract.strike")
            ],
            relationships: [new Relation(1, "units", "*", 0, "units", null, null, null, 2)],
            legs: [
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Long Condor Spread",
            type: "long_condor_spread",
            description: "A strategy that profits when the stock price only moves a little. \
                            Pay a premium after buying a call and selling a call at a higher strike both in the money, selling a call and buying a call at a higher strike both out of the money. \
                            You profit when the stock price stays within the range: strike of in the money option you bought + premium paid < stock price < strike of out of the money option you bought - premium paid \
                            Depending on which direction the stock goes, losses are capped at: \
                            premium paid",
            sentiment: ["neutral"],
            linkedProperties: ["expiration", "optionType"],
            rules: [new Rule(0, "contract.strike", "<", 1, "contract.strike"),
            new Rule(2, "contract.strike", ">", 3, "contract.strike"),
            new Rule(0, "contract.strike", "<", 0, "contract.stock_price"),
            new Rule(1, "contract.strike", "<", 1, "contract.stock_price"),
            new Rule(2, "contract.strike", ">", 2, "contract.stock_price"),
            new Rule(3, "contract.strike", ">", 3, "contract.stock_price")],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Short Condor Spread",
            type: "short_condor_spread",
            description: "A strategy that profits when the stock price only moves a little. \
                            Receive a premium after selling a call and buying a call at a higher strike both in the money, buying a call and selling a call at a higher strike both out of the money. \
                            You profit when: stock price > strike of in the money option you sold + premium received OR stock price > strike of out of the money option you sold - premium received \
                            Depending on which direction the stock goes, losses are capped at: \
                            difference between the strikes of the calls - premium received OR difference between the strikes of the puts - premium received.",
            sentiment: ["volatile"],
            linkedProperties: ["expiration", "optionType"],
            rules: [new Rule(0, "contract.strike", ">", 1, "contract.strike"),
            new Rule(2, "contract.strike", "<", 3, "contract.strike"),
            new Rule(0, "contract.strike", "<", 0, "contract.stock_price"),
            new Rule(1, "contract.strike", "<", 1, "contract.stock_price"),
            new Rule(2, "contract.strike", ">", 2, "contract.stock_price"),
            new Rule(3, "contract.strike", ">", 3, "contract.stock_price")],
            relationships: [],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: ""
                    }
                ),
                new OptionLeg(
                    {
                        action: "short",
                        expiration: 0,
                        optionType: ""
                    }
                )
            ],
            level: "spreads",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Strap Straddle",
            type: "strap_straddle",
            description: "A basic strategy that profits when the stock price moves drastically up or down but profits more if it goes up. \
                            Pay a premium to buy a call and a put at the same strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["bullish", "volatile"],
            linkedProperties: ["expiration", "strike"],
            rules: [],
            relationships: [new Relation(0, "units", "*", 1, "units", null, null, null, 2)],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "advanced",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
    new Strategy(
        {
            name: "Strap Strangle",
            type: "strap_strangle",
            description: "A basic strategy that profits when the stock price moves drastically up or down but profits more if it goes up. \
                            Pay a premium to buy a call and a put; With the call strike being higher than the put strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["bullish", "volatile"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "strike", ">", 1, "strike")],
            relationships: [new Relation(0, "units", "*", 1, "units", null, null, null, 2)],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ],
            level: "advanced",
            basicGraph: "long_call_simple.png",
            expandedGraph: "long_call_expanded.png",
            unlimitedLoss: false
        }
    ),
];