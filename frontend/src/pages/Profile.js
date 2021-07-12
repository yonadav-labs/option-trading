import React, { useEffect, useContext, useState, useRef } from 'react';
import { Helmet } from "react-helmet";
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import './Profile.css';
import getApiUrl, { getAllTradeTypes, GetGaEventTrackingFunc } from '../utils';
import { useHistory, Link } from 'react-router-dom';
import { startCase } from 'lodash';
import LinkIcon from '@material-ui/icons/Link';
import { IconButton, Tooltip, CardContent, Grid, Typography, Divider, List, ListItem, Switch, OutlinedInput, Button, Select, MenuItem, Box, Modal, TextField } from '@material-ui/core';
import { FormControl, FormLabel, FormGroup, FormControlLabel } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const GaEvent = GetGaEventTrackingFunc('preference');

const Profile = () => {
    const { oktaAuth, authState } = useOktaAuth();
    const { user, setUser } = useContext(UserContext);
    const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
    const [brokers, setBrokers] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [chosenBrokers, setChosenBrokers] = useState([]);
    const [disabledStrategies, setDisabledStrategies] = useState([]);
    const [nickName, setNickName] = useState(null);
    const [resultMsg, setResultMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const API_URL = getApiUrl();
    const reason = useRef("");
    const history = useHistory();

    const copyReferralLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(user.referral_link);
        setTooltipOpen(true);
    }

    const cancelSubscription = () => {
        const { accessToken } = authState;
        fetch(`${API_URL}/subscription/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.accessToken}`,
            },
            body: JSON.stringify({ 'reason': reason.current.value !== "" ? "Reason: " + reason.current.value : "User cancelled with no reason" })
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject();
                }
                return response;
            })
            .then((data) => {
                history.go(0);
            })
            .catch((err) => {
                /* eslint-disable no-console */
                console.error(err);
            });
    }

    const onChangeBrokers = (event) => {
        GaEvent('adjust broker');
        let selected = event;
        setErrMsg("");
        setResultMsg("");
        setChosenBrokers(selected);
    };

    const onChangeStrategy = (event) => {
        GaEvent('adjust disabled strategy');
        let strategy = event.target.value;
        let disabled_strategies = disabledStrategies.slice();

        setResultMsg("");
        if (event.target.checked) {  // enable -> remove
            let idx = disabled_strategies.indexOf(strategy);
            if (idx > -1) {
                disabled_strategies.splice(idx, 1);
            }
        } else {  // add to disabled
            disabled_strategies.push(strategy)
        }
        setDisabledStrategies(disabled_strategies);
    };

    const onChangeNickName = (event) => {
        GaEvent('adjust nickname');
        setErrMsg("");
        setResultMsg("");
        setNickName(event.target.value.trim());
    };

    const saveUpdates = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { accessToken } = authState;
        let data = { disabled_strategies: disabledStrategies, nick_name: nickName };
        if (chosenBrokers.length > 0) {
            data.brokers = chosenBrokers;
        }

        fetch(`${API_URL}/users/${user.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.accessToken}`,
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then(error => { throw new Error(error.nick_name[0]) })
                }
                return response.json();
            })
            .then((data) => {
                setUser(data);
                setResultMsg("Saved successfully!");
            })
            .catch((err) => {
                /* eslint-disable no-console */
                setErrMsg(err.message);
            });
    };

    useEffect(() => {
        if (!authState.isAuthenticated) {
            console.log('Token Expired!');
            history.push('/signin');
        } else {
            const { accessToken } = authState;

            // get possible brokers
            fetch(`${API_URL}/brokers/`, {
                headers: {
                    Authorization: `Bearer ${accessToken.accessToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    setBrokers(data);
                })
                .catch((err) => {
                    /* eslint-disable no-console */
                    console.error(err);
                });

            // get past trades
            fetch(`${API_URL}/trade_snapshots_history`, {
                headers: {
                    Authorization: `Bearer ${accessToken.accessToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    setTradeHistory(data);
                })
                .catch((err) => {
                    /* eslint-disable no-console */
                    console.error(err);
                });
        }
    }, [oktaAuth, authState]); // Update if authState changes

    useEffect(() => {
        if (user) {
            setNickName(user.nick_name);
            setChosenBrokers(user.brokers);
            setDisabledStrategies(user.disabled_strategies || []);
        }
    }, [user]);

    if (!user || brokers.length == 0) {
        return (
            <Grid container justifyContent="center">
                <Typography variant="body2">Loading...</Typography>
            </Grid>
        );
    }

    return (
        <Grid>
            <Helmet>
                <title>Tigerstance | Profile</title>
            </Helmet>
            <Grid container justifyContent="center">
                <Divider />
                <Box px={20} pt={4}>
                    <Grid container direction="row">
                        <Grid item direction="column" md={4} style={{ background: "linear-gradient(90deg, #FF8F2B 0%, #FFD338 100%)", p: "20px, 0" }} >
                            <CardContent style={{ textAlign: "center", p: "1.25rem" }}>
                                <Typography variant="h6" style={{ fontWeight: 600, color: "white" }}>{user.email}</Typography>
                                {user.subscription ?
                                    <Grid>
                                        <Typography variant="body2" paragraph="true" color="white">Current plan: Pro member</Typography>
                                        {user.subscription.type === 'PAYPAL' ?
                                            <>
                                                <Typography variant="body2" paragraph="true" color="white"><span style={{ fontWeight: 600 }}>Next billing time: </span>{user.subscription.detail.next_billing_time}</Typography>
                                                <Button style={{ background: "white" }} onClick={() => setShowCancelSubscriptionModal(true)} >Cancel Subscription</Button>
                                            </>
                                            :
                                            <Typography variant="body2" paragraph="true" color="white"><span style={{ fontWeight: 600 }}>Gift membership expiring on: </span>{user.subscription.expire_at}</Typography>
                                        }
                                    </Grid>
                                    :
                                    <Grid>
                                        <Typography variant="body2" paragraph="true" color="white">Current plan: Basic member</Typography>
                                        <a href="/pricing">
                                            <Button variant="contained" style={{ width: '15rem', size: "medium", fullWidth: true, background: "white" }}>
                                                <Typography variant="h6" style={{ color: "black" }}>Join Pro</Typography>
                                            </Button>
                                        </a>
                                    </Grid>
                                }
                                <hr></hr>
                                <Grid direction="row">
                                    <Grid direction="column" md={12}>
                                        <Typography variant="body1" style={{ mt: 4, color: "white" }}>
                                            Get a free month of Pro membership for you and your friends.
                                            Just copy and paste link below to your friends to sign up.
                                        </Typography>
                                        <Grid className="referral-wrapper">
                                            <span className="referral_link" style={{ color: "white" }}>{user.referral_link}</span>
                                            <Tooltip
                                                PopperProps={{
                                                    disablePortal: true,
                                                }}
                                                onClose={() => setTooltipOpen(false)}
                                                open={tooltipOpen}
                                                disableFocusListener
                                                disableHoverListener
                                                disableTouchListener
                                                title="Link copied to clipboard"
                                            >
                                                <IconButton onClick={copyReferralLink}><LinkIcon /></IconButton>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Grid>
                        <Grid item direction="column" md={8}>
                            <CardContent style={{ p: "1.25rem" }}>
                                <Typography variant="h6" style={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>Profile</Typography>
                                <Grid direction="row">
                                    <Grid direction="column" md={12}>
                                        <Typography variant="body2" paragraph="true" pt={1}><span style={{ fontWeight: 600 }}>Email: </span>{user.email}</Typography>
                                    </Grid>
                                </Grid>
                                <Typography variant="h6" style={{ fontWeight: 600, borderBottom: "1px solid #e0e0e0" }}>Settings</Typography>
                                <Grid direction="row">
                                    <Grid direction="column" md={12} pt={1}>
                                        <FormGroup controlId="id-nick-name">
                                            <FormLabel style={{ display: "block", color: "black" }}>Nickname</FormLabel>
                                            <FormControl>
                                                <OutlinedInput label={null} id="id-nick-name" value={nickName} onChange={onChangeNickName} placeholder="(empty)" />
                                            </FormControl>
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                                <Grid direction="row">
                                    <Grid column="column" md={12} py={1}>
                                        <FormGroup controlId="id-brokers">
                                            <FormLabel style={{ display: "block", color: "black" }}>Stock Brokerage</FormLabel>
                                            <small style={{ display: "block", mb: 2 }} >This setting will be used to estimate commission costs.</small>
                                            {brokers.length > 0 ?
                                                <FormControl>
                                                    <Select
                                                        value={chosenBrokers}
                                                        onChange={(e) => onChangeBrokers([e.target.value])}
                                                        displayEmpty
                                                        label={null}
                                                    >
                                                        <MenuItem disabled value="">Choose a broker</MenuItem>
                                                        {
                                                            brokers.map(broker => (
                                                                <MenuItem key={broker.id} value={broker.id}>{broker.name}</MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                </FormControl>
                                                : null}
                                        </FormGroup>
                                    </Grid>
                                </Grid>


                                <FormLabel style={{ display: "block", color: "black" }}>Enabled Strategies</FormLabel>
                                <Grid container direction="row">
                                    {getAllTradeTypes().map(type => (
                                        <Grid item direction="column" sm={6}>
                                            <FormControlLabel
                                                key={type}
                                                id={type}
                                                label={startCase(type) + ((user.disallowed_strategies.indexOf(type) != -1) ? ' (Pro)' : '')}
                                                value={type}
                                                onChange={onChangeStrategy}
                                                control={<Switch defaultChecked={
                                                    (!user.disabled_strategies
                                                        || (user.disabled_strategies.indexOf(type) === -1))
                                                    && (user.disallowed_strategies.indexOf(type) === -1)}
                                                    disabled={(user.disallowed_strategies.indexOf(type) != -1)} />}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid direction="row">
                                    <Grid direction="column" md={12}>
                                        <Typography style={{ mb: 2, mt: 0 }} sx={{ color: "error.main" }}>{errMsg}</Typography>
                                    </Grid>
                                    <Grid direction="column" md={12}>
                                        <Typography style={{ mb: 2, mt: 0 }} sx={{ color: "success.main" }}>{resultMsg}</Typography>
                                    </Grid>
                                    <Grid direction="column" md={12}>
                                        <Button style={{ background: "#FF8F2B", color: "white" }} onClick={saveUpdates} variant="primary">Save</Button>
                                    </Grid>
                                </Grid>

                                <Typography variant="h6" style={{ fontWeight: 600, mt: 4, borderBottom: "1px solid #e0e0e0", paddingTop: "1.25rem" }}>Saved positions</Typography>
                                <Grid direction="row">
                                    <Grid direction="column" md={12}>
                                        {
                                            tradeHistory.length > 0 ?
                                                <List>
                                                    {tradeHistory.map(trade => (
                                                        <ListItem key={trade.meta.snapshot_id}>
                                                            <Link style={{ display: "inline-block" }} to={"/t/" + trade.meta.snapshot_id} target="_blank">
                                                                {trade.stock.ticker.symbol} {startCase(trade.type)} -
                                                                {trade.legs.map(leg => {
                                                                    if (leg.contract) {
                                                                        return `${leg.is_long ? ' Long ' : ' Short '} ${new Date(leg.contract.expiration * 1000).toLocaleDateString('en-US', { year: "2-digit", month: "numeric", day: "2-digit" })} $${leg.contract.strike} ${leg.contract.is_call ? 'Call' : 'Put'}, `;
                                                                    }
                                                                })}
                                                                {trade.net_debit_per_unit >= 0 ? `$${Math.abs(trade.net_debit_per_unit)} Credit` : `$${Math.abs(trade.net_debit_per_unit)} Debit`}
                                                            </Link>
                                                        </ListItem>
                                                    ))}
                                                </List> :
                                                <Grid>(empty)</Grid>
                                        }
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>

            <Modal
                open={showCancelSubscriptionModal}
                onClose={() => setShowCancelSubscriptionModal(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    bgcolor: 'background.paper',
                    boxShadow: 24
                }}>
                    <Grid container p={2}>
                        <Grid item sm={8} align="left">
                            <Typography p={2}>Cancel Subscription</Typography>
                        </Grid>
                        <Grid item sm={4} align="right">
                            <Button onClick={() => setShowCancelSubscriptionModal(false)}><CloseIcon /></Button>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Typography variant="body2" paragraph="true" p={2}>We are sorry to see you go. If you don't mind, we would appreciate if you could enter your reason for cancelling and/or any feedback you'd like to give us.</Typography>
                    <FormGroup sx={{ px: 2, pb: 2 }} controlId="cancelSubscription.ReasonTextarea">
                        <FormLabel style={{ color: "black" }}>Reason</FormLabel>
                        <FormControl>
                            <TextField multiline inputRef={reason} rows={3} placeholder="Optional" />
                        </FormControl>
                    </FormGroup>
                    <Divider sx={{ pt: 2 }} />
                    <Grid align="right" p={2}>
                        <Button variant="outlined" onClick={() => setShowCancelSubscriptionModal(false)}>
                            Cancel
                        </Button>
                        <Button style={{ background: "#FF8F2B", color: "white" }} variant="contained" onClick={cancelSubscription}>Submit</Button>
                    </Grid>
                </Box>
            </Modal>
        </Grid >
    );
}

export default Profile;
