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
    action = "";
    optionType = "";
    contract = {};

    constructor(data) {
        super("option");
        Object.assign(this, data);
    }
}

class Strategy {
    id = "";
    name = "";
    description = "";
    legs = [];

    constructor(data) {
        Object.assign(this, data);
        // TODO hash strategy settings to help identify it
        this.id = this.name.replace(/\s+/g, '');
    }
}

export const strategies = [
    new Strategy(
        {
            name: "Put Credit Spread",
            description: "",
            legs: [
                new OptionLeg(
                    {
                        ticker: "",
                        action: "buy",
                        expiration: 0,
                        optionType: "put"
                    }
                ),
                new OptionLeg(
                    {
                        ticker: "",
                        action: "sell",
                        expiration: 0,
                        optionType: "put"
                    }
                )
            ]
        }
    ),
    new Strategy(
        {
            name: "another strat",
            description: "",
            legs: [
                new OptionLeg(
                    {
                        ticker: "",
                        action: "buy",
                        expiration: new Date(),
                        type: "call"
                    }
                ),
                new OptionLeg(
                    {
                        ticker: "",
                        action: "sell",
                        expiration: new Date(),
                        type: "call"
                    }
                )
            ]
        }
    )
];