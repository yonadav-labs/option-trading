import React, { useEffect, useState } from 'react';
import { Grid, Typography, FormControl, Select, MenuItem, InputLabel, Alert } from "@material-ui/core";
import getApiUrl, { PercentageFormatter, PriceFormatter, GetGaEventTrackingFunc } from '../utils';
import Axios from 'axios';

const GaEvent = GetGaEventTrackingFunc('options builder');

export default function CustomizableBuildLeg(props) {
    const { leg, index, selectedStrategy, expirationTimestampsOptions, selectedTicker, updateLeg, allLegs, ruleMessages } = props

    const [strikes, setStrikes] = useState([]);
    const [selectedStrike, setSelectedStrike] = useState(null);
    const [legMessage, setLegMessage] = useState([])
    const [errorParts, setErrorParts] = useState([])
    const API_URL = getApiUrl();

    function getSecondPart(str) {
        return str.split('.')[1];
    }

    // check for rule messages
    useEffect(() => {
        if (ruleMessages) {
            let message = []
            let errors = []
            ruleMessages.map(rule => {
                if (rule.leg === index) {
                    message.push(rule)
                    errors.push(getSecondPart(rule.property))
                }
            })
            setErrorParts(errors)
            setLegMessage(message)
        } else { setLegMessage([]) }
    }, [ruleMessages, leg.expiration, leg.action, leg.optionType, leg.strike,])

    useEffect(async () => {
        setStrikes([]);
        setSelectedStrike('')

        if (leg.type === "option" && leg.action && leg.optionType && leg.expiration) {
            // call api to get option chain
            try {
                let url = `${API_URL}/tickers/${selectedTicker.symbol}/contracts/`;
                let body = {
                    expiration_timestamps: [leg.expiration],
                    filters: {}
                };
                const response = await Axios.post(url, body);
                const filteredContracts = response.data.contracts.filter(contract => (leg.optionType === "call" && contract.is_call) || (leg.optionType === "put" && !contract.is_call));
                let selectedStrikeIsValid = false;
                let strikes = filteredContracts.map(val => {
                    const percentageChange = ((props.atmPrice - val.strike) / props.atmPrice) * -1;
                    const option = {
                        value: val.strike,
                        label: <>{PriceFormatter(val.strike)}&nbsp;({percentageChange > 0 ? "+" : ""}{PercentageFormatter(percentageChange)})</>
                    };

                    if (leg.strike === '') {
                        setSelectedStrike('')
                    } else if (val.strike === leg.strike) {
                        selectedStrikeIsValid = true;
                        setSelectedStrike(option);
                    }

                    return option;
                });
                strikes.push({ value: props.atmPrice, label: <>{PriceFormatter(props.atmPrice)}&nbsp;(Current Price)</>, disabled: true });
                setStrikes(strikes.sort((a, b) => a.value - b.value));
                updateLeg("contract", selectedStrikeIsValid ? filteredContracts.filter((val) => val.strike === leg.strike)[0] : {}, index);
            } catch (error) {
                console.error(error);
            }
        }
    }, [leg.expiration, leg.action, leg.optionType, leg.strike, selectedStrategy]);

    const onExpirationChange = (event) => {
        updateLeg("expiration", event.target.value, index);
    }

    const onStrikeSelectChange = (e) => {
        updateLeg("strike", e ? e.value : '', index);
        setSelectedStrike(e);
    }

    switch (leg.type) {
        case "option":
            return (
                <>
                    {legMessage.length > 0 ?
                        <>
                            {legMessage.map(val => {
                                return (
                                    <Grid px={4} pb={3}>
                                        <Alert hidden={!val} severity="error">{val.message}</Alert>
                                    </Grid>
                                );
                            })}
                        </>
                        :
                        null
                    }
                    <Grid container spacing={2} alignItems="center" pb={3}>
                        <Grid item xs={12} sm={1}>
                            <Typography variant="h5">Leg {index + 1}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={2.75} px={1}>
                            <FormControl fullWidth>
                                <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Action</Typography></InputLabel>
                                <Select
                                    label="Action.."
                                    value={leg.action}
                                    onChange={(e) => { updateLeg("action", e.target.value, index); GaEvent('adjust leg action'); }}
                                    disabled={selectedStrategy.legs[index].action}
                                    style={{ height: 45 }}
                                    MenuProps={{ style: { maxHeight: "400px", }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                                >
                                    <MenuItem value="long">Long</MenuItem>
                                    <MenuItem value="short">Short</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={2.75} px={1}>
                            <FormControl fullWidth error={!leg.optionType}>
                                <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Call/Put</Typography></InputLabel>
                                <Select
                                    label="Call/Put.."
                                    fullWidth
                                    style={{ height: 45 }}
                                    onChange={(e) => { updateLeg("optionType", e.target.value, index); GaEvent('adjust leg option'); }}
                                    value={leg.optionType || 0}
                                    disabled={selectedStrategy.legs[index].optionType}
                                    MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                                >
                                    <MenuItem disabled value={0}><span style={{ color: "#b3b3b3" }}>Select an option type</span></MenuItem>
                                    <MenuItem value="call">Call</MenuItem>
                                    <MenuItem value="put">Put</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2.75} px={1}>
                            <FormControl fullWidth error={leg.expiration === 0}>
                                <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Expiration Date</Typography></InputLabel>
                                <Select
                                    label="Expiration Date...."
                                    onChange={(e) => { onExpirationChange(e); GaEvent('adjust leg expiration'); }}
                                    style={{ height: 45 }}
                                    value={leg.expiration || 0}
                                    disabled={selectedStrategy.legs[index].expiration || !leg.optionType}
                                    MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                                >
                                    <MenuItem disabled value={0}><span style={{ color: "#b3b3b3" }}>Select an expiration date</span></MenuItem>
                                    {expirationTimestampsOptions.map(date => <MenuItem value={date.value}>{date.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2.75} px={1}>
                            <FormControl fullWidth error={errorParts.includes("strike") || !selectedStrike}>
                                <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Strike Price</Typography></InputLabel>
                                <Select
                                    label="Strike Price...."
                                    disabled={strikes.length === 0}
                                    value={selectedStrike || 0}
                                    onChange={(e) => { onStrikeSelectChange(e.target.value); GaEvent('adjust leg strike'); }}
                                    style={{ height: 45 }}
                                    MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                                >
                                    <MenuItem disabled value={0}><span style={{ color: "#b3b3b3" }}>Select a strike price</span></MenuItem>
                                    {strikes.map((strike, index) => <MenuItem disabled={strike.disabled} value={strike} key={index}> {strike.label} </MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid >
                </>
            )

        case "stock":
            return (
                <Grid container spacing={2} alignItems="center" pb={3}>
                    <Grid item xs={12} sm={1}>
                        <Typography variant="h5">Leg {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Action</Typography></InputLabel>
                            <Select
                                label="Action.."
                                value={leg.action}
                                disabled={true}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value="long">Long</MenuItem>
                                <MenuItem value="short">Short</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel style={{ zIndex: -100 }} style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Shares</Typography></InputLabel>
                            <Select
                                label="Shares.."
                                value={leg.shares}
                                disabled={true}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px", }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            )

        case "cash":
            return (
                <Grid container spacing={2} alignItems="center" pb={3}>
                    <Grid item xs={12} sm={1}>
                        <Typography variant="h5">Leg {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Action</Typography></InputLabel>
                            <Select
                                label="Action.."
                                value={"long"}
                                disabled={true}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px", }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value="long">Keep as collateral</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel style={{ zIndex: -100 }} shrink={true}><Typography variant="h6">Cash</Typography></InputLabel>
                            <Select
                                label="Cash.."
                                value={0}
                                disabled={true}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px", }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value={0}>{leg.value > 0 ? '$' + leg.value : 'TBD'}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            )

        default:
            break;
    }
}