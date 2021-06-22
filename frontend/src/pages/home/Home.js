import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import TickerCard from "./TickerCard";
import { Button, Typography, Grid, Card, CardContent, useMediaQuery, CardMedia, Skeleton } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { getTopMovers, newLoadExpirationDates, newLoadTickers } from "../../utils";
import TickerSelectionCard from "./TickerSelectionCard";
import StarRateIcon from '@material-ui/icons/StarRate';
import colors from "../../colors";

const Feedback = () => {
    return [1].map((item, index) => (<Grid item key={index} lg={3}>
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
            <CardContent sx={{ minHeight: 239 }}>
                <Grid container justifyContent="center" alignItems="center">
                    <StarRateIcon style={{ color: colors.orange }} />
                    <StarRateIcon style={{ color: colors.orange }} />
                    <StarRateIcon style={{ color: colors.orange }} />
                    <StarRateIcon style={{ color: colors.orange }} />
                    <StarRateIcon style={{ color: colors.orange }} />
                    <br />
                    <Typography variant="body2" textAlign="center" py={2}>
                        “Tigerstance helped me make decisions with ease and confidence when market was volatile.”
                    </Typography>
                    <br />
                    <Typography variant="subtitle2" textAlign="center" py={2}>Jay S, Portfolio Manager, Eystra Capital, LLC.</Typography>
                </Grid>
            </CardContent>
        </Card>
    </Grid>)
    )
}
const ToolCard = ({ children, imageName, isMobile }) => (
    <Card sx={{ p: 4, position: "relative", borderRadius: 4, boxShadow: 4, minHeight: `${isMobile ? "0" : "350px"}` }}>
        <CardMedia
            sx={{ position: "absolute", top: 0, right: 0, height: "100%", width: "100%" }}
            image={imageName}
        />
        <CardContent sx={{ position: "relative", backgroundColor: "transparent" }}>
            {children}
        </CardContent>
    </Card>
);

export default function Home() {
    const [allTickers, setAllTickers] = useState([]);
    const [topMovers, setTopMovers] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const [loadingTopMovers, setLoadingTopMovers] = useState(true);
    const [selectedTicker, setSelectedTicker] = useState(null);
    const [headers, setHeaders] = useState({});
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
    const useStyles = makeStyles({
        benefitsUpperTitle: {
            textAlign: "left",
            fontFamily: "Roboto",
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: "11px"
        },
        benefitsTitle: {
            textAlign: "left",
            fontFamily: "Roboto",
        },
        benefitsDescription: {
            textAlign: "left",
            fontFamily: "Roboto",
        },
        card: {
            padding: 10
        },
        whiteText: {
            color: colors.whiteText
        }
    });

    const classes = useStyles();
    const setBasicInfo = () => { };
    const setModalActive = () => { };

    const setExpirationTimestamps = (val) => {

    }

    const onTickerSelectionChange = (selected) => {
        if (selected) {
            newLoadExpirationDates(headers, selected, setModalActive, setExpirationTimestamps, setBasicInfo, setSelectedTicker);
        }
    };

    const RenderMovers = () => {
        if (isMobile) {
            const movers = topMovers.slice(0, 12);
            let displayedMovers = [];

            for (let i = 0; movers.length > i; i = i + 2) {
                if (i + 2 > movers.length) {
                    break;
                }
                displayedMovers.push([movers[i], movers[i + 1]]);
            }

            return (
                <Grid item p={1} style={{ overflow: "auto", display: "-webkit-flex" }}>
                    {displayedMovers.map((couple, index) => index < 11 ? (
                        <Grid key={index} container item xs={6} lg={3} mr={5} direction={"column"} alignItems="center">
                            <Grid item>
                                <TickerCard ticker={couple[0]} />
                            </Grid>
                            <Grid item mt={2}>
                                <TickerCard ticker={couple[0 + 1]} />
                            </Grid>
                        </Grid>) : null)}
                </Grid>
            )
        }

        return (
            <Grid container item rowSpacing={3} columnSpacing={1} px={3}>
                {topMovers.map((mover, index) => index < 12 ? (
                    <Grid key={index} container item xs={6} md={2} xl={1} justifyContent="center">
                        {loadingTopMovers ?
                            <Skeleton variant="rectangular"><TickerCard /></Skeleton>
                            :
                            <TickerCard ticker={mover} />
                        }
                    </Grid>)
                    : null
                )}
            </Grid>
        )
    }
    useEffect(() => {
        newLoadTickers(headers, setAllTickers).then(() => { });
        getTopMovers(headers).then((data) => {
            if (data) {
                setTopMovers(data);
            }
            setLoadingTopMovers(false)
        });
    }, []);

    return (
        <>
            <Helmet>
                <title>Tigerstance | Trade Options Smarter</title>
            </Helmet>
            <Grid container p={3}>
                <Grid container item justifyContent="center" alignItems="center" flexDirection="row">
                    <Grid item xs={12} md={12} lg={6} px={8}>
                        <Typography variant="button" textAlign={isMobile ? "center" : "left"}>Trading for everyone</Typography>
                        <Typography variant="h2" textAlign={isMobile ? "center" : "left"}>We do the math,</Typography>
                        <Typography variant="h2" textAlign={isMobile ? "center" : "left"}>so you don't have to.</Typography>
                        <Typography variant="body1" textAlign={isMobile ? "center" : "left"} pr={isMobile ? 0 : 15}>
                            Use market-beating hedge fund manager’s trading tactic to manage your portfolio.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={6} px={isMobile ? 0 : 5} py={4}>
                        <TickerSelectionCard allTickers={allTickers}
                            onChange={onTickerSelectionChange}
                            selectedTicker={selectedTicker}
                        />
                    </Grid>
                </Grid>
                <Grid container item py={4}>
                    <Grid item py={2} px={3} lg={12}>
                        <Typography variant="h6">Start with recent high movers</Typography>
                    </Grid>
                    <RenderMovers />
                </Grid>
                <Grid container item py={4} px={3} spacing={3}>
                    <Grid item lg={12}>
                        <Typography variant="h6">Tools built for your needs</Typography>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <ToolCard imageName="Homepage-Discover.png" isMobile={isMobile}>
                            <Typography variant="h6" sx={{ marginTop: 0 }} gutterBottom>Discover</Typography>
                            <Typography variant="body1">
                                Enter what price you think the stock will be and by when. See the trades you can make to get the highest potential return.
                            </Typography>
                            <br />
                            <Button variant="outlined" size="large" href="/discover" to="/discover">
                                Discover Now
                            </Button>
                        </ToolCard>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <ToolCard imageName="Homepage-Build.png" isMobile={isMobile}>
                            <Typography variant="h6" sx={{ marginTop: 0 }} gutterBottom>Build</Typography>
                            <Typography variant="body1">
                                Create your options strategy and get real-time feedback. Understand your strategy with interactive graph and profit/loss details.
                            </Typography>
                            <br />
                            <Button variant="outlined" size="large" href="/build" to="/build">
                                Build Now
                            </Button>
                        </ToolCard>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <ToolCard imageName="Homepage-Browse.png" isMobile={isMobile}>
                            <Typography variant="h6" sx={{ marginTop: 0 }} gutterBottom>Screen</Typography>
                            <Typography variant="body1">
                                Find options that match your trading goals. View the options chains for the stock you selected and use filters to screen for options that match your strategy.
                            </Typography>
                            <br />
                            <Button variant="outlined" size="large" href="/screen" to="/screen">
                                Screen Now
                            </Button>
                        </ToolCard>
                    </Grid>
                </Grid>
                <Grid container item py={4} px={3} spacing={3}>
                    <Grid item lg={12}>
                        <Typography variant="h6">See what others have to say</Typography>
                    </Grid>
                    <Grid container item justifyContent="center">
                        <Feedback />
                    </Grid>
                </Grid>
                <Grid container item py={4} px={3} spacing={3}>
                    <Grid container item lg={6} >
                        <Card sx={{ p: 4, borderRadius: 4, background: "linear-gradient(270deg, rgba(255, 211, 56, 1), rgba(255, 143, 43, 1))" }}>
                            <CardContent>
                                <Typography variant="h5" color="white">Become a Tigerstance Member</Typography>
                                <Typography variant='body2' color="white">
                                    Upgrade to Tiger Pro membership to unlock powerful options analytics features. Free trial for a week, cancel anytime.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    href="/signin/register"
                                    to="/signin/register"
                                >
                                    Sign up, it’s free
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid px={2} container item lg={6}>
                        <Card sx={{ p: 4, borderRadius: 4 }}>
                            <CardContent>
                                <Typography variant="h5">Need help?</Typography>
                                <Typography variant='body2'>
                                    Visit our support page for answers you may have regarding our tools, our memberships, and more.
                                </Typography>
                                <Button variant="contained" size="large" href="/" to="/">Explore Support</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
