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

    constructor(data) {
        Object.assign(this, data);
        // TODO hash strategy settings to help identify it
        this.id = this.name.toLowerCase().replace(/\s+/g, '_');
    }
}

class Rule {
    legAIndex = 0;
    legProperty = '';
    operator = '';
    legBIndex = 0;

    constructor(legAIndex, legProperty, operator, legBIndex) {
        this.legAIndex = legAIndex;
        this.legProperty = legProperty;
        this.operator = operator;
        this.legBIndex = legBIndex;
    }
}

export const strategies = [
    // new Strategy(
    //     {
    //         name: "Put Credit Spread",
    //         description: "",
    //         sentiment: ["bull", "flat"],
    //         linkedProperties: ["expiration"],
    //         legs: [
    //             new OptionLeg(
    //                 {
    //                     ticker: "",
    //                     action: "long",
    //                     expiration: "",
    //                     optionType: "put"
    //                 }
    //             ),
    //             new OptionLeg(
    //                 {
    //                     ticker: "",
    //                     action: "short",
    //                     expiration: "",
    //                     optionType: "put"
    //                 }
    //             )
    //         ]
    //     }
    // ),
    new Strategy(
        {
            name: "Bull Call Spread",
            description: "",
            sentiment: ["bull"],
            linkedProperties: ["expiration"],
            rules: [new Rule(0, "contract.strike", "<", 1)],
            legs: [
                new OptionLeg(
                    {
                        ticker: "",
                        action: "long",
                        expiration: 0,
                        optionType: "call"
                    }
                ),
                new OptionLeg(
                    {
                        ticker: "",
                        action: "short",
                        expiration: 0,
                        optionType: "call"
                    }
                )
            ]
        }
    )
];