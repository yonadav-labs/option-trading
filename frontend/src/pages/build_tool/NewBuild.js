import React, { useState, useEffect, useContext, } from "react";
import { Helmet } from "react-helmet";
import Axios from 'axios';
import LoadingModal from '../../components/LoadingModal';
import LandingView from "./LandingView";
import MainView from "./MainView";

// utils
import getApiUrl, {
    newLoadTickers, newLoadExpirationDates, GetGaEventTrackingFunc, getDefaultDisAllowedTradeTypes,
    TimestampDateFormatter
} from "../../utils";
import { useOktaAuth } from '@okta/okta-react';
import { cloneDeep, get, set, isEmpty } from 'lodash';
import { strategies as allStrategies } from '../../blobs/Strategies';
import UserContext from '../../UserContext';

// url querying
import { useHistory, useLocation } from "react-router-dom";
import { addQuery, useSearch } from "../../components/querying";

const GaEvent = GetGaEventTrackingFunc('build');

export default function NewBuild() {
    const API_URL = getApiUrl();
    const { user } = useContext(UserContext);
    const history = useHistory()
    const location = useLocation()
    const querySymbol = useSearch(location, 'symbol')

    const premiumPriceOptions = [{ value: "market", label: "Market price" }, { value: "mid", label: "Mid/Mark price" }];
    const operators = {
        "<": (a, aProperty, b, bProperty) => { return get(a, aProperty) < get(b, bProperty) },
        "<=": (a, aProperty, b, bProperty) => { return get(a, aProperty) <= get(b, bProperty) },
        ">": (a, aProperty, b, bProperty) => { return get(a, aProperty) > get(b, bProperty) },
        ">=": (a, aProperty, b, bProperty) => { return get(a, aProperty) >= get(b, bProperty) },
        "==": (a, aProperty, b, bProperty) => { return get(a, aProperty) == get(b, bProperty) },
        "*": (a, aProperty, aPropertyDefaultVal, b, bProperty, bPropertyDefaultVal) => { return get(a, aProperty, aPropertyDefaultVal) * get(b, bProperty, bPropertyDefaultVal) },
        "-": (a, aProperty, aPropertyDefaultVal, b, bProperty, bPropertyDefaultVal) => { return get(a, aProperty, aPropertyDefaultVal) - get(b, bProperty, bPropertyDefaultVal) }
    }

    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [basicInfo, setBasicInfo] = useState({});
    const [selectedPremiumType, setSelectedPremiumType] = useState(premiumPriceOptions[0]);
    const [broker, setBroker] = useState(null);

    // expiration date states
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])

    // legs/strategy states
    const [selectedStrategy, setSelectedStrategy] = useState(null)
    const [strategyDetails, setStrategyDetails] = useState(null);
    const [ruleMessages, setRuleMessages] = useState([]);
    const [legs, setLegs] = useState([]);
    const [availableStrategies, setAvailableStrategies] = useState(allStrategies);
    const [disAllowedStrategies, setDisAllowedStrategies] = useState([]);

    // component management states
    const [modalActive, setModalActive] = useState(false);
    const [strategyDisabled, setStrategyDisabled] = useState(true)
    const [pageState, setPageState] = useState(true);
    const [disableBuildButton, setDisableBuildButton] = useState(true);

    // okta states
    const [headers, setHeaders] = useState({});
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestampsOptions([])
        setBasicInfo({});
        setModalActive(false);
        setStrategyDetails(null);
    }

    useEffect(() => {
        if (authState.isAuthenticated) {
            const { accessToken } = authState;
            setHeaders({ Authorization: `Bearer ${accessToken.accessToken}` });
        } else {
            setHeaders({});
        }
    }, [oktaAuth, authState]);

    useEffect(() => {
        if (user) {
            setAvailableStrategies(allStrategies.filter(x => (user.disabled_strategies.indexOf(x.type) === -1)
                && user.disallowed_strategies.indexOf(x.type) === -1));
            setDisAllowedStrategies(allStrategies.filter(x => (user.disallowed_strategies.indexOf(x.type) != -1)));
        } else {
            setAvailableStrategies(allStrategies.filter(x => (getDefaultDisAllowedTradeTypes().indexOf(x.type) === -1)));
            setDisAllowedStrategies(allStrategies.filter(x => (getDefaultDisAllowedTradeTypes().indexOf(x.type) != -1)));
        }
    }, [user]);

    // load all tickers
    useEffect(() => {
        newLoadTickers(headers, setAllTickers, setSelectedTicker, querySymbol, onTickerSelectionChange)
    }, []);

    const setExpirationTimestamps = (val) => {
        if (val.length > 0) {
            let arr = []
            val.map((timestamp, index) => {
                arr.push({ value: timestamp, label: TimestampDateFormatter(timestamp / 1000) });
            })
            setExpirationTimestampsOptions(arr);
        }
    }

    const onBasicInfoChange = (val) => {
        setBasicInfo(val);
    }

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('adjust ticker');
        resetStates();
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, onBasicInfoChange, setSelectedTicker);
            addQuery(location, history, 'symbol', selected.symbol);
            setStrategyDisabled(false);
        }
        if (selectedStrategy) {
            setRuleMessages([0]);
            setLegs(cloneDeep(selectedStrategy.legs));
        }
    };

    const onStrategySelectionChange = (strategy) => {
        GaEvent('select strategy');
        window.scrollTo(0, 0);
        setSelectedStrategy(strategy)
        setStrategyDetails(null);
        setRuleMessages([0]);
        setPageState(false)
        if (strategy) {
            setLegs(cloneDeep(strategy.legs));
        }
    }

    const updateLeg = (key, value, index) => {
        // check if key is a linkedProperty
        if (selectedStrategy && selectedStrategy.linkedProperties.includes(key)) {
            // set value for all legs
            setLegs(prevState => {
                const newState = prevState.map(val => { set(val, key, value); return val });
                return checkRulesAndRelationships(prevState, newState, index, key);
            });
        } else {
            setLegs(prevState => {
                const newState = [...prevState.slice(0, index), { ...prevState[index], [key]: value }, ...prevState.slice(index + 1)];
                return checkRulesAndRelationships(prevState, newState, index, key);
            });
        }
        setStrategyDetails(null);
    }

    const checkRulesAndRelationships = (prevState, newState, index, key) => {
        if (prevState[index][key]) {
            enforceRules(selectedStrategy.rules, newState);
        }
        selectedStrategy.relationships.map(relation => {
            const operation = operators[relation.operator];
            newState[relation.legAIndex][relation.legAProperty] =
                operation(newState[relation.legBIndex], relation.legBProperty, relation.legBPropertyDefaultVal,
                    newState[relation.legCIndex], relation.legCProperty, relation.legCPropertyDefaultVal);
        });
        return newState;
    }

    const enforceRules = (rules, legs) => {
        let messages = [];
        const finalResult = rules.reduce((prev, curr) => {
            const legAIndex = curr.legAIndex;
            const legBIndex = curr.legBIndex;
            const legAProperty = curr.legAProperty;
            const legBProperty = curr.legBProperty;
            const operator = curr.operator;
            const ruleResult = operators[operator](legs[legAIndex], legAProperty, legs[legBIndex], legBProperty);
            if (!ruleResult) {
                messages.push(`Leg ${legAIndex + 1}'s ${legAProperty.replace(".", " ").replace("_", " ")} 
                needs to be ${operator} Leg ${legBIndex + 1}'s ${legBProperty.replace(".", " ").replace("_", " ")}.`);
            }
            return (prev && ruleResult);
        }, true);
        setRuleMessages(messages);
        return finalResult;
    }

    const getStrategyDetails = async () => {
        GaEvent('build strategy');
        setModalActive(true);
        let strategy = {
            type: selectedStrategy.id,
            stock_snapshot: {
                ticker_id: selectedTicker.id,
                external_cache_id: selectedTicker.external_cache_id,
                ticker_stats_id: selectedTicker.ticker_stats_id,
            },
            leg_snapshots: [],
            is_public: false,
            // target_price_lower: 0, // there is no price target
            // target_price_upper: 0, // there is no price target
            premium_type: selectedPremiumType.value,
        };

        legs.map((leg) => {
            let legSnapshot = { is_long: leg.action === "long", units: leg.units }
            if (leg.type === "option") {
                let contract = {
                    ticker_id: leg.contract.ticker.id,
                    external_cache_id: leg.contract.external_cache_id,
                    is_call: leg.contract.is_call,
                    strike: leg.contract.strike,
                    expiration_timestamp: leg.contract.expiration
                }
                legSnapshot.contract_snapshot = contract;
            } else if (leg.type === "stock") {
                legSnapshot.stock_snapshot = {
                    ticker_id: selectedTicker.id,
                    external_cache_id: selectedTicker.external_cache_id,
                    ticker_stats_id: selectedTicker.ticker_stats_id,
                };
                legSnapshot.units = leg.shares;
            } else {
                legSnapshot.cash_snapshot = true;
                legSnapshot.units = leg.value;
            }
            strategy.leg_snapshots.push(legSnapshot);
        });

        try {
            let headers = {
                'Content-Type': 'application/json',
            }
            if (authState.isAuthenticated) {
                const { accessToken } = authState;
                headers['Authorization'] = `Bearer ${accessToken.accessToken}`
            }

            let url = `${API_URL}/trade_snapshots`;
            const response = await Axios.post(url, strategy, {
                headers: headers
            });

            setStrategyDetails(response.data.trade_snapshot);
            setBroker(response.data.broker);
        } catch (error) {
            console.error(error);
        }
        setModalActive(false);
    }

    useEffect(() => {
        if (legs) {
            setDisableBuildButton(
                (!selectedTicker
                    || !legs.reduce((prevVal, currVal) => (currVal.type !== "option" || prevVal && !isEmpty(currVal.contract)), true))
                || ruleMessages.length > 0
                || !legs[0].strike > 0);
        }
    }, [ruleMessages]);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Build</title>
                <meta name="description" content="Build strategies with Tigerstance." />
            </Helmet>
            <LoadingModal active={modalActive}></LoadingModal>
            {
                pageState ?
                    <LandingView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        strategyDisabled={strategyDisabled}
                        selectedStrategy={selectedStrategy}
                        onStrategySelectionChange={onStrategySelectionChange}
                        availableStrategies={availableStrategies}
                        disAllowedStrategies={disAllowedStrategies}
                        user={user}
                    />
                    :
                    <MainView
                        allTickers={allTickers}
                        selectedTicker={selectedTicker}
                        onTickerSelectionChange={onTickerSelectionChange}
                        basicInfo={basicInfo}
                        selectedStrategy={selectedStrategy}
                        onStrategySelectionChange={onStrategySelectionChange}
                        expirationTimestampsOptions={expirationTimestampsOptions}
                        legs={legs}
                        updateLeg={updateLeg}
                        getStrategyDetails={getStrategyDetails}
                        strategyDetails={strategyDetails}
                        ruleMessages={ruleMessages}
                        broker={broker}
                        availableStrategies={availableStrategies}
                        user={user}
                        disableBuildButton={disableBuildButton}
                    />
            }
        </>
    );
}
