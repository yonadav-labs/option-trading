import React, { useContext, useState } from 'react';
import { Helmet } from "react-helmet";
import { Modal } from 'react-bootstrap';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import Subscribe from '../components/Subscribe';
import {
    getPaypalMonthlyPlanId, getPaypalYearlyPlanId, GetGaEventTrackingFunc,
    getPaypalPastMonthlyPlanIds, getPaypalPastYearlyPlanIds
} from '../utils';
import LinkIcon from '@material-ui/icons/Link';
import { IconButton, Tooltip } from '@material-ui/core';
import { Grid, Card, CardContent, CardActions, Button, Container, Typography, Link, List, ListItem, Box } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/styles";


const GaEvent = GetGaEventTrackingFunc('user');

const CustomListItem = withStyles((theme) => ({
    root: {
        display: 'inline-block',
        textAlign: 'center'
    },
}))(ListItem);

const useStyles = makeStyles((theme) => ({
    textGrey: {
        color: 'rgba(0, 0, 0, 0.87)',
        color: 'rgb(0, 0, 0)'
    },
    textOrange: {
        color: '#FF8F2B',
    },
    pricingCardContent: {
        height: '90%'
    },
    pricingCardList: {
        borderTop: '1px solid',
        borderColor: 'rgba(51, 51, 51, .2)',
        borderColor: 'rgb(213, 214, 213)'
    },
    pricingCard: {
        height: "100%",
        align: "center",
        paddingBottom: "32px",
    },
    badge: {
        position: "absolute",
        top: "15px",
        left: "25%",
        width: "50%",
        padding: "2px 2%",
        borderRadius: "3px",
        zIndex: "1",
        textAlign: "center",
        backgroundColor: "#333333",
        color: "#FAFAFA",
        fontSize: "10px",
        fontWeight: "700"
    },
    highlighted: {
        border: "5px solid #0af99577",
    },
    referralLink: {
        maxWidth: "420px",
        display: "inline-block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        overflowWrap: "break-word",
    },
    referralWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }
}));

export default function Pricing() {
    const { authState } = useOktaAuth();
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [paypalPlanID, setPaypalPlanID] = useState(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const { user } = useContext(UserContext);
    const classes = useStyles();

    const subscribeMonthly = () => {
        setShowSubscribeModal(true);
        setPaypalPlanID(getPaypalMonthlyPlanId());
    }

    const subscribeYearly = () => {
        setShowSubscribeModal(true);
        setPaypalPlanID(getPaypalYearlyPlanId());
    }

    const copyReferralLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(user.referral_link);
        setTooltipOpen(true);
    }

    const isUserMonthlySubscribed = () => user && user.subscription
        && (user.subscription.paypal_plan_id === getPaypalMonthlyPlanId()
            || getPaypalPastMonthlyPlanIds().indexOf(user.subscription.paypal_plan_id) > -1);

    const isUserYearlySubscribed = () => user && user.subscription
        && (user.subscription.paypal_plan_id === getPaypalYearlyPlanId()
            || getPaypalPastYearlyPlanIds().indexOf(user.subscription.paypal_plan_id) > -1);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Pricing</title>
                <meta name="description" content="How does Tigerstance's pricing work? Tigerstance BASIC is available for free. 
                Tigerstance PRO costs $8.25 per month when billed annually and $9.90 per month when billed monthly." />
            </Helmet>
            <Container maxWidth="xl" fluid >
                <Container align="center">
                    <Typography variant="caption" fontWeight="fontWeightBold" className={classes.textOrange} mt={6} style={{ display: 'block' }}>PRICING</Typography>
                    <Typography variant="h3" mt={1}>Subscription Plans</Typography>
                    <Typography variant="body1" mt={2.5} >
                        Upgrade to Tiger Pro membership to unlock powerful options analytics features.<br />Free trial for a week, cancel anytime.
                    </Typography>
                    {user ?
                        <>
                            <Typography variant="body1" align="center" mt={2} >
                                Get a free month of Pro membership for you and your friends. <br></br>
                                Just copy and paste link below to your friends to sign up.
                            </Typography>
                            <Box className={classes.referralWrapper}>
                                <Typography className={classes.referralLink}>{user.referral_link}</Typography>
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
                            </Box>
                        </>
                        :
                        <Typography variant="body1" align="center" mt={2} >Get a free month of Pro membership when you signup and refer us to your friends.</Typography>
                    }
                </Container>

                <Grid container justifyContent="center" spacing={3} mt={6} mb={10} >
                    <Grid item xs={12} md={3} p={3} >
                        <Card sx={{ boxShadow: 3 }} className={`${classes.pricingCard} ${authState.isAuthenticated && !isUserMonthlySubscribed() && !isUserYearlySubscribed() && classes.highlighted}`} >
                            <CardContent align="center" className={classes.pricingCardContent}>
                                <Typography variant="caption" fontWeight="fontWeightBold" display="block" mt={2} >
                                    BASIC
                                </Typography>
                                <Typography variant="h4" mt={2} >
                                    <Link href="/signin/register" className={classes.textGrey}>Just sign up</Link>
                                </Typography>
                                <Box className={classes.pricingCardList} mt={7} pt={3} >
                                    <List>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;Unlock 9 options trading strategies.
                                        </CustomListItem>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;Exclusive market <Link href="/reports" className={classes.textGrey}><b>reports</b></Link>.
                                        </CustomListItem>
                                        {authState.isAuthenticated ?
                                            <CustomListItem><span className={classes.textOrange}>&#10003;</span>&nbsp;Strategy <Link href="/profile" className={classes.textGrey} ><b>personalization</b></Link>.</CustomListItem>
                                            : <CustomListItem><span className={classes.textOrange}>&#10003;</span>&nbsp;Strategy personalization.</CustomListItem>
                                        }
                                        {authState.isAuthenticated ?
                                            <CustomListItem><span className={classes.textOrange}>&#10003;</span>&nbsp;Broker <Link href="/profile" className={classes.textGrey} ><b>commission cost calculation</b></Link>.</CustomListItem>
                                            : <CustomListItem><span className={classes.textOrange}>&#10003;</span>&nbsp;Broker commission cost calculation.</CustomListItem>
                                        }
                                    </List>
                                </Box>
                            </CardContent>
                            <CardActions style={{ justifyContent: 'center' }} >
                                {authState.isAuthenticated ?
                                    <></>
                                    :
                                    <Button variant="contained" size="large" href="/signin/register">Sign up, it's free</Button>
                                }
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3} p={3}>
                        <Card sx={{ boxShadow: 3 }} className={`${classes.pricingCard} ${isUserMonthlySubscribed() && classes.highlighted}`} >
                            <CardContent align="center" className={classes.pricingCardContent}>
                                <Typography variant="caption" fontWeight="fontWeightBold" display="block" mt={2} >
                                    PRO MONTHLY
                                </Typography>
                                <Typography variant="h4" mt={2} >
                                    $9.90/mo
                                </Typography>
                                <Box className={classes.pricingCardList} mt={7} pt={3} >
                                    <List>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;Unlock all 21 options strategies.
                                        </CustomListItem>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;Everything in BASIC membership.
                                        </CustomListItem>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;Unlimited usage for all features.
                                        </CustomListItem>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;More Pro member features to come!
                                        </CustomListItem>

                                    </List>
                                </Box>
                            </CardContent>
                            <CardActions style={{ justifyContent: 'center' }} >
                                {authState.isAuthenticated ?
                                    isUserMonthlySubscribed() ?
                                        <></>
                                        :
                                        <Button onClick={() => {
                                            GaEvent('click subscribe monthly');
                                            subscribeMonthly();
                                        }} variant="contained" size="large">Become Pro</Button>
                                    :
                                    <Button variant="contained" size="large" href="/signin">Become Pro</Button>
                                }
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3} p={3} style={{ position: 'relative' }}>
                        <Box className={classes.badge} >
                            MOST POPULAR
                        </Box>
                        <Card sx={{ boxShadow: 3 }} className={`${classes.pricingCard} ${classes.yearCard} ${isUserYearlySubscribed() && classes.highlighted}`} >
                            <CardContent align="center" className={classes.pricingCardContent}>
                                <Typography variant="caption" fontWeight="fontWeightBold" display="block" mt={2} >
                                    PRO ANNUALLY
                                </Typography>
                                <Typography variant="h4" mt={2} >
                                    $99.00/yr
                                </Typography>
                                <Typography mt={2} >
                                    Save 16.6% ($19.80) annually
                                </Typography>
                                <Box className={classes.pricingCardList} mt={1.5} pt={3} >
                                    <List>
                                        <CustomListItem>
                                            <span className={classes.textOrange}>&#10003;</span>&nbsp;Everything in the monthly plan.
                                        </CustomListItem>
                                    </List>
                                </Box>
                            </CardContent>
                            <CardActions style={{ justifyContent: 'center' }} >
                                {authState.isAuthenticated ?
                                    isUserYearlySubscribed() ?
                                        <></>
                                        :
                                        <Button onClick={() => {
                                            GaEvent('click subscribe yearly');
                                            subscribeYearly();
                                        }} variant="contained" size="large">Become Pro</Button>
                                    :
                                    <Button variant="contained" size="large" href="/signin">Become Pro</Button>
                                }
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>

            </Container>

            {
                user &&
                <Modal
                    show={showSubscribeModal}
                    onHide={() => {
                        GaEvent('close subscribe modal');
                        setShowSubscribeModal(false);
                    }}
                    backdrop="static"
                    keyboard={false}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Subscribe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Subscribe username={user.username} plan_id={paypalPlanID}></Subscribe>
                    </Modal.Body>
                </Modal>
            }
        </>

    );
}
