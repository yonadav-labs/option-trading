import React, { useEffect, useState } from 'react';
import { Grid, Typography, FormControl, Select, MenuItem, InputLabel } from "@material-ui/core";
import getApiUrl, { PercentageFormatter, PriceFormatter, GetGaEventTrackingFunc } from '../utils';
import Axios from 'axios';

export default function CustomizableBuildLeg(props) {
    const { leg, index, selectedStrategy, expirationTimestampsOptions, selectedTicker, updateLeg } = props

    const [strikes, setStrikes] = useState([]);
    const [selectedStrike, setSelectedStrike] = useState(null);
    const API_URL = getApiUrl();

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
                <Grid container alignItems="center" pb={3}>
                    <Grid item xs={1}>
                        <Typography variant="h5">Leg {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Action</Typography></InputLabel>
                            <Select
                                fullWidth
                                value={leg.action}
                                onChange={(e) => updateLeg("action", e.target.value, index)}
                                disabled={selectedStrategy.legs[index].action}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px", }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value="long">Long</MenuItem>
                                <MenuItem value="short">Short</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Call/Put</Typography></InputLabel>
                            <InputLabel shrink={false}>{leg.optionType ? "" :
                                <Typography variant="body1" style={{ color: "#cbcbcb", marginTop: "-7px" }}>Select an option type</Typography>}
                            </InputLabel>
                            <Select
                                fullWidth
                                style={{ height: 45 }}
                                onChange={(e) => updateLeg("optionType", e.target.value, index)}
                                value={leg.optionType}
                                disabled={selectedStrategy.legs[index].optionType}
                                MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value="call">Call</MenuItem>
                                <MenuItem value="put">Put</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Expiration Date</Typography></InputLabel>
                            <InputLabel shrink={false}>{leg.expiration !== 0 ? "" :
                                <Typography variant="body1" style={{ color: "#cbcbcb", marginTop: "-7px" }}>Select an expiration date</Typography>}
                            </InputLabel>
                            <Select
                                onChange={(e) => { onExpirationChange(e); }}
                                fullWidth
                                style={{ height: 45 }}
                                value={leg.expiration || 0}
                                disabled={selectedStrategy.legs[index].expiration}
                                MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                {expirationTimestampsOptions.map(date => <MenuItem value={date.value}>{date.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Strike Price</Typography></InputLabel>
                            <InputLabel shrink={false}>{selectedStrike ? "" :
                                <Typography variant="body1" style={{ color: "#cbcbcb", marginTop: "-7px" }}>Select a strike price</Typography>}
                            </InputLabel>
                            <Select
                                disabled={strikes.length === 0}
                                value={selectedStrike}
                                onChange={(e) => onStrikeSelectChange(e.target.value)}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px" }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                {strikes.length > 0 ?
                                    strikes.map((strike, index) => <MenuItem disabled={strike.disabled} value={strike} key={index}> {strike.label} </MenuItem>) : null
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            )

        case "stock":
            return (
                <Grid container alignItems="center" pb={3}>
                    <Grid item xs={1}>
                        <Typography variant="h5">Leg {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Action</Typography></InputLabel>
                            <Select
                                fullWidth
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
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Shares</Typography></InputLabel>
                            <Select
                                fullWidth
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
                <Grid container alignItems="center" pb={3}>
                    <Grid item xs={1}>
                        <Typography variant="h5">Leg {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Action</Typography></InputLabel>
                            <Select
                                fullWidth
                                value={"long"}
                                disabled={true}
                                style={{ height: 45 }}
                                MenuProps={{ style: { maxHeight: "400px", }, anchorOrigin: { vertical: "bottom", horizontal: "center" }, getContentAnchorEl: () => null, }}
                            >
                                <MenuItem value="long">Keep as collateral</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2.75} px={1}>
                        <FormControl fullWidth>
                            <InputLabel shrink={true}><Typography variant="h6">Cash</Typography></InputLabel>
                            <Select
                                fullWidth
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