import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useOktaAuth } from '@okta/okta-react';
import getApiUrl, { newLoadTickers, GetGaEventTrackingFunc } from '../utils';
import ModalSpinner from '../components/ModalSpinner';
import HeatMapGraph from '../components/HeatMapGraph';
import Axios from 'axios';
import { Paper, Stack, Container, Divider, makeStyles, Typography, FormControl, Select, MenuItem, InputLabel } from "@material-ui/core";
import TickerAutocomplete from "../components/TickerAutocomplete";

const GaEvent = GetGaEventTrackingFunc('surface');

const useStyles = makeStyles((theme) => ({
    customPaper: {
        padding: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(7),
            paddingRight: theme.spacing(7),
            margin: theme.spacing(1),
            borderRadius: 50
        }
    }
}));

export default function Surface() {
    const classes = useStyles();

    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [modalActive, setModalActive] = useState(false);
    const [headers, setHeaders] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();

    // heatmap
    const [baseHeatmapData, setBaseHeatmapData] = useState(null);
    const [selectedContractType, setSelectedContractType] = useState('call');
    const [selectedMetric, setSelectedMetric] = useState('Implied Volatility');

    const contractTypeOptions = [
        { value: 'call', label: 'Call' },
        { value: 'put', label: 'Put' }
    ]

    const targetOptions = [
        { value: 'Implied Volatility', label: 'Implied Volatility' },
        { value: 'Open Interest', label: 'Open Interest' },
        { value: 'Volume', label: 'Volume' },
        { value: 'vol_per_oi', label: 'VOL/OI' }
    ]

    const loadHeatmapData = (symbol, params) => {
        try {
            setModalActive(true);
            setBaseHeatmapData(null);

            Axios.get(`${getApiUrl()}/tickers/${symbol}/heatmap_data/`, { params })
                .then(response => {
                    setBaseHeatmapData(response.data);
                    setModalActive(false);
                })
        } catch (error) {
            console.error(error);
            setModalActive(false);
        }
    };

    const onTickerSelectionChange = (e, selected) => {
        GaEvent('ajust ticker');
        setSelectedTicker(selected);
    };

    const onChangeContractType = (option) => {
        GaEvent('adjust contract type');
        setSelectedContractType(option);
    }

    const onChangeTarget = (option) => {
        GaEvent('adjust metric');
        setSelectedMetric(option);
    }

    useEffect(() => {
        if (selectedTicker) {
            let params = { contract_type: selectedContractType }
            loadHeatmapData(selectedTicker.symbol, params);
        }
    }, [selectedTicker, selectedContractType])

    useEffect(() => {
        if (authState.isAuthenticated) {
            const { accessToken } = authState;
            setHeaders({ Authorization: `Bearer ${accessToken.accessToken}` });
        } else {
            setHeaders({});
        }
    }, [oktaAuth, authState]);

    useEffect(() => {
        if (headers) {
            newLoadTickers(headers, setAllTickers);
        }
    }, [headers]);

    return (
        <Container id="content" style={{ "marginTop": "2rem" }} fluid>
            <Helmet>
                <title>Tigerstance | Implied Volatility Surface and more</title>
                <meta name="description"
                    content="Gauge the market using Implied Volatility Surface, Open Interest and Volume. Quickly identify calls/puts to sell by their annualized premium return and probability of expiring out of the money." />
            </Helmet>
            <ModalSpinner active={modalActive}></ModalSpinner>
            <Container>
                <Paper className={classes.customPaper} elevation={4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" variant="middle" flexItem />} spacing={2}>
                        <TickerAutocomplete
                            tickers={allTickers}
                            onChange={onTickerSelectionChange}
                            displayLabel
                        />

                        <FormControl disabled={!selectedTicker} fullWidth>
                            <InputLabel><Typography variant="h6">Type</Typography></InputLabel>
                            <Select
                                id="contract-type"
                                fullWidth
                                defaultValue={selectedContractType}
                                onChange={(e) => onChangeContractType(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                            >
                                {contractTypeOptions.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl disabled={!selectedTicker} fullWidth>
                            <InputLabel><Typography variant="h6">Metric</Typography></InputLabel>
                            <Select
                                id="metric"
                                defaultValue={selectedMetric}
                                fullWidth
                                onChange={(e) => onChangeTarget(e.target.value)}
                                style={{ paddingBottom: "5px" }}
                                variant="standard"
                            >
                                {targetOptions.map((option, index) => <MenuItem value={option.value} key={index}> {option.label} </MenuItem>)}
                                {selectedContractType == 'call' ?
                                    <MenuItem value={"apr"} key={4}> Annualized Covered Call Premium Profit if OTM </MenuItem>
                                    :
                                    <MenuItem value={"apr"} key={4}> Annualized Cash Secured Put Premium Profit if OTM </MenuItem>
                                }
                            </Select>
                        </FormControl>

                    </Stack>
                </Paper>
            </Container>
            <br />
            <Container>
                <Typography variant="h4" align="center">Options Chain Panorama View</Typography>
                <Typography variant="body1" align="center">
                    <lu>
                        <li>Gauge the market using Implied Volatility Surface, Open Interest and Volume.</li>
                        <li>Quickly identify calls/puts to sell by their annualized premium return and probability of expiring out of the money.</li>
                    </lu>
                </Typography>
            </Container>

            <Container>
                {baseHeatmapData ?
                    <HeatMapGraph
                        className="my-4"
                        zLabel={selectedMetric}
                        data={baseHeatmapData}
                        contractType={selectedContractType}
                    />
                    :
                    <div style={{ height: '320px' }}></div>
                }
            </Container>
        </Container >
    );
}