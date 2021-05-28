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
        this.legbPropertyDefaultVal = legBPropertyDefaultVal;
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
            sentiment: ["bull"],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                )
            ]
        }
    ),
    new Strategy({
        name: "Covered Call",
        type: "covered_call",
        description: "Receive a premium to allow your shares of the stock to be sold at the strike price until the expiration. \
                        You profit when the stock price does not move below the: strike price - the premium.",
        sentiment: ["flat, bear"],
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
                    ticker: "",
                    shares: 100
                }
            )
        ]
    }
    ),
    new Strategy(
        {
            name: "Long Put",
            type: "long_put",
            description: "Pay a premium to have the option to sell shares of the stock at the strike price until the expiration. \
                            You profit when the stock price does not move below the: strike price + the premium.",
            sentiment: ["bear"],
            legs: [
                new OptionLeg(
                    {
                        action: "long",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ]
        }
    ),
    new Strategy(
        {
            name: "Cash Secured Put",
            type: "cash_secured_put",
            description: "Receive a premium to allow your cash to be exchanged for shares of the stock at the strike price until the expiration. \
                            You profit when the stock price does not move below: the strike price - the premium.",
            sentiment: ["flat, bull"],
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
            ]
        }
    ),
    new Strategy(
        {
            name: "Bull Call Spread",
            type: "bull_call_spread",
            description: "Pay a premium for buying a call and selling a call at a strike higher than from the call you bought. \
                            You profit when the stock price moves above the: strike of the call that you bought + (premium of the call you bought - premium of the call you sold).",
            sentiment: ["bull"],
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
            ]
        }
    ),
    new Strategy(
        {
            name: "Bear Call Spread",
            type: "bear_call_spread",
            description: "Receive a premium from buying a call and selling a call at a strike lower than from the call you bought. \
                            You profit when the stock price moves below the: strike price of the call you sold + (premium of the call you sold - premium of the call you bought).",
            sentiment: ["bear", "flat"],
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
            ]
        }
    ),
    new Strategy(
        {
            name: "Bear Put Spread",
            type: "bear_put_spread",
            description: "Pay a premium for buying a put and selling a put at a strike lower than from the put you bought. \
                            You profit when the stock price moves below the: strike of the put you bought - (premium of the put you bought - premium of the put you sold).",
            sentiment: ["bear"],
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
            ]
        }
    ),
    new Strategy(
        {
            name: "Bull Put Spread",
            type: "bull_put_spread",
            description: "Receive a premium from buying a put and selling a put at a strike higher than from the put you bought. \
                            You profit when the stock price moves above the: strike of the put you sold - (premium of the put you sold - premium of the put you bought).",
            sentiment: ["bull", "flat"],
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
            ]
        }
    ),
    new Strategy(
        {
            name: "Long Straddle",
            type: "long_straddle",
            description: "A basic strategy that profits when the stock price moves dratistically up or down. \
                            Pay a premium to buy a call and a put at the same strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["volitile"],
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
            ]
        }
    ),
    new Strategy(
        {
            name: "Long Strangle",
            type: "long_strangle",
            description: "A basic strategy that profits when the stock price moves dratistically up or down. \
                            Pay a premium to buy a call and a put; With the call strike being higher than the put strike. \
                            You profit when the stock price moves: above the strike + premium paid OR below the strike - premium paid \
                            Losses are capped at the premium paid to initiate this strategy.",
            sentiment: ["volitile"],
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
            ]
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
            ]
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
            ]
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
            sentiment: ["volitile"],
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
            ]
        }
    )
];