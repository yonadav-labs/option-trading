// cash;
// contract;
// cost;
// display_name;
// is_long;
// name;
// stock;
// units;

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
    ticker = "";
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
    constant = 0;

    constructor(legAIndex, legAProperty, operator, legBIndex, legBProperty, constant) {
        this.legAIndex = legAIndex;
        this.legAProperty = legAProperty;
        this.operator = operator;
        this.legBIndex = legBIndex;
        this.legBProperty = legBProperty;
        this.constant = constant;
    }

}

export const strategies = [    
    new Strategy(
        {
            name: "Long Call",
            description: "Pay a premium to have the option until the expiration to buy shares of the stock at the strike price",
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
            description: "Receive a premium to allow your shares of the stock to be sold at the strike price until the expiration",
            sentiment: ["flat, bear"],
            legs: [
                new StockLeg(
                    {
                        ticker: "",
                        shares: 100
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
            name: "Long Put",
            description: "Pay a premium to have the option until the expiration to sell shares of the stock at the strike price",
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
            description: "Receive a premium to allow your cash to be exchanged for shares of the stock at the strike price until the expiration",
            sentiment: ["flat, bull"],
            relationships: [new Relation(0, "value", "*", 1, "contract.stock_price", 100)],
            legs: [
                new CashLeg(
                    {
                        value: 0
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
            name: "Bull Call Spread",
            description: "Pay a cost for buying a call and selling a call at a strike higher than from the call you bought. You profit when the stock price goes up.",
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
            description: "Receive a credit from buying a call and selling a call at a strike higher than from the call you bought. You profit when the stock price goes down or stays flat.",
            sentiment: ["bear", "flat"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", ">", 1, "contract.strike")],
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
            name: "Bear Put Spread",
            description: "Pay a cost for buying a put and selling a put at a strike lower than from the put you bought. You profit when the stock price goes down.",
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
            description: "Receive a credit from buying a put and selling a put at a strike higher than from the put you bought. You profit when the stock price goes up or stays flat.",
            sentiment: ["bull", "flat"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", "<", 1, "contract.strike")],
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
    )
];