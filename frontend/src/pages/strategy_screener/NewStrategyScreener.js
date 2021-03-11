import React, {useState, useEffect} from "react";
import {CssBaseline, Container } from "@material-ui/core";
import ModalSpinner from '../../components/ModalSpinner';
import LandingView from "./LandingView";

// utils
import { newLoadTickers, newLoadExpirationDates } from "../../utils";
import { useOktaAuth } from '@okta/okta-react';

export default function NewStrategyScreener() {
    // stock/ticker states
    const [allTickers, setAllTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState();
    const [basicInfo, setBasicInfo] = useState({});

    // expiration date states
    const [expirationTimestamps, setExpirationTimestamps] = useState([]);
    const [expirationTimestampsOptions, setExpirationTimestampsOptions] = useState([])
    const [selectedExpirationTimestamp, setSelectedExpirationTimestamp] = useState([]);

    // component management states
    const [modalActive, setModalActive] = useState(false);
    const [expirationDisabled, setExpirationDisabled] = useState(true)

    // okta states
    const [headers, setHeaders] = useState(null);
    const { oktaAuth, authState } = useOktaAuth();

    const resetStates = () => {
        setSelectedTicker(null);
        setExpirationTimestamps([]);
        setExpirationTimestampsOptions([])
        setSelectedExpirationTimestamp([]);
        setBasicInfo({});
        setModalActive(false);
    }

    const onTickerSelectionChange = (e, selected) => {
        resetStates()
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setBasicInfo, setSelectedTicker);
        } else { 
            setExpirationDisabled(true) 
        }
    };

    const onExpirationSelectionChange = (e, selected) => {
        setSelectedExpirationTimestamp(selected)
    }

    useEffect(() => {
        if (authState.isAuthenticated) {
            const { accessToken } = authState;
            setHeaders({Authorization: `Bearer ${accessToken.accessToken}`});
        } else {
            setHeaders({});
        }
    }, [oktaAuth, authState]);

    useEffect(() => {
        if (headers) {
            newLoadTickers(headers, setAllTickers);
        }
    }, [headers]);

    // when expiration dates are changed set new date options
    useEffect(() => {
        console.log(expirationTimestamps)
        setExpirationDisabled(true)
        if (expirationTimestamps.length > 0) {
            let arr = []
            expirationTimestamps.map((timestamp, index) => {
                // Yahoo's timestamp * 1000 = TD's timestamp.
                const date = new Date(timestamp < 9999999999 ? timestamp * 1000 : timestamp)
                .toLocaleDateString('en-US');
                arr.push({ value: timestamp, label: date });
            })
            setExpirationTimestampsOptions(arr)
            setExpirationDisabled(false)
        }
    }, [expirationTimestamps])

    return (
        <Container className="min-vh-100">
            <CssBaseline />
            <ModalSpinner active={modalActive}></ModalSpinner>
            <LandingView 
                allTickers={allTickers} 
                onTickerSelectionChange={onTickerSelectionChange} 
                expirationTimestampsOptions={expirationTimestampsOptions}
                expirationDisabled={expirationDisabled}
                onExpirationSelectionChange={onExpirationSelectionChange}
                selectedExpirationTimestamp={selectedExpirationTimestamp}
            />
        </Container>
    );
}
