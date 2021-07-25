import React from "react";
import { makeStyles } from '@material-ui/styles';
import { Grid, Typography, Paper, Divider, useMediaQuery, FormControl, Select, MenuItem, Box, Card, Alert, Button } from "@material-ui/core";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import NewTickerSummary from "../../components/NewTickerSummary";
import BuildDetailsCard from "../../components/cards/BuildDetailsCard";
import CustomizableBuildLeg from "../../components/CustomizableBuildLeg";
import BuildLegCard from "../../components/cards/BuildLegCard";
import { isEmpty } from 'lodash';

const useStyles = makeStyles({
    root: {
        overflowX: "auto",
    },
});

export default function MainView(props) {
    const classes = useStyles();

    const {
        allTickers,
        selectedTicker,
        onTickerSelectionChange,
        basicInfo,
        selectedStrategy,
        onStrategySelectionChange,
        expirationTimestampsOptions,
        legs,
        updateLeg,
        getStrategyDetails,
        strategyDetails,
        ruleMessages,
        broker,
        availableStrategies,
        user,
        disableBuildButton
    } = props

    // mobile responsiveness
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
    // mobile responsiveness
    const isCard = useMediaQuery(theme => theme.breakpoints.down('sm'));

    return (
        <Grid container minHeight="inherit">
            <Grid item sm className={classes.root}>
                <Grid component={Paper} container elevation={4} p={3} style={isMobile ? { width: "100vw" } : null}>
                    {isMobile ?
                        <>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    <Typography variant="subtitle1">{basicInfo ? `${basicInfo.symbol} - ${basicInfo.companyName}` : <br />}</Typography>
                                </Grid>
                                <Grid item>
                                    <FormControl fullWidth>
                                        <Select
                                            id="expiration-dates"
                                            value={selectedStrategy}
                                            fullWidth
                                            onChange={(e) => onStrategySelectionChange(e.target.value)}
                                            variant="standard"
                                            MenuProps={{
                                                style: { maxHeight: "400px" },
                                                anchorOrigin: { vertical: "bottom", horizontal: "center" },
                                                getContentAnchorEl: () => null,
                                            }}
                                        >
                                            {availableStrategies.map(strat => <MenuItem value={strat}>{strat.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Divider />
                        </>
                        :
                        <Grid container alignItems="center" spacing={2} pb={3}>
                            <Grid item>
                                <Typography variant="subtitle1" color={selectedTicker ? null : "error"}>Ticker Symbol</Typography>
                            </Grid>
                            <Grid item sm>
                                <TickerAutocomplete
                                    tickers={allTickers}
                                    onChange={onTickerSelectionChange}
                                    size={'small'}
                                    value={selectedTicker}
                                />
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle1">Strategy</Typography>
                            </Grid>
                            <Grid item sm={4.8}>
                                <FormControl fullWidth>
                                    <Select
                                        id="expiration-dates"
                                        value={selectedStrategy}
                                        fullWidth
                                        onChange={(e) => onStrategySelectionChange(e.target.value)}
                                        variant="standard"
                                        MenuProps={{
                                            style: { maxHeight: "400px" },
                                            anchorOrigin: { vertical: "bottom", horizontal: "center" },
                                            getContentAnchorEl: () => null,
                                        }}
                                    >
                                        {availableStrategies.map(strat => <MenuItem value={strat}>{strat.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    }
                    <NewTickerSummary basicInfo={basicInfo} isMobile={isMobile} />
                </Grid>
                <Grid container pt={3} justifyContent="center">
                    <Grid item >
                        {user === null || user.subscription === null || user.subscription.status !== "ACTIVE" ?
                            <Alert severity="warning">
                                Unlock all strategies by going <a href="/pricing">PRO</a>!
                            </Alert>
                            :
                            null
                        }
                    </Grid>
                </Grid>
                <Grid pt={4} px={4}>
                    {legs.map((leg, index) => {
                        switch (leg.type) {
                            case "option":
                                return (
                                    <CustomizableBuildLeg leg={leg} index={index} key={index} selectedTicker={selectedTicker}
                                        atmPrice={basicInfo.latestPrice} updateLeg={updateLeg}
                                        selectedStrategy={selectedStrategy} expirationTimestampsOptions={expirationTimestampsOptions}
                                        allLegs={legs} ruleMessages={ruleMessages}
                                    />
                                );
                            case "stock":
                                return (
                                    <CustomizableBuildLeg leg={leg} index={index} key={index}
                                        selectedTicker={selectedTicker} updateLeg={updateLeg}
                                    />
                                );
                            case "cash":
                                return (
                                    <CustomizableBuildLeg leg={leg} index={index} key={index}
                                        selectedTicker={selectedTicker} updateLeg={updateLeg}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </Grid>
                <Grid container justifyContent="center">
                    <Button variant="containedPrimary" disabled={disableBuildButton} onClick={getStrategyDetails} size="large">
                        Build Strategy
                    </Button>
                </Grid>
                <Grid p={4}>
                    {strategyDetails ?
                        <BuildDetailsCard
                            trade={strategyDetails}
                            broker={broker}
                        />
                        :
                        <>
                            <Box component={Card} p={2}>
                                <Grid container alignItems="center" pb={1}>
                                    <Grid item>
                                        <Typography variant="h5">
                                            {selectedStrategy.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={0.2}></Grid>
                                    <Alert severity="info">
                                        Select the Expiration Date and Strike Price in order to view the strategy details
                                    </Alert>
                                </Grid>
                                {legs.map((leg, index) => {
                                    if (!isEmpty(leg.contract)) {
                                        return (
                                            <BuildLegCard leg={leg} hideTitle={true} index={index} key={index} />
                                        )
                                    }
                                })}
                            </Box>
                        </>
                    }
                </Grid>
                <Typography>*Options data is delayed by 15 minutes.</Typography>
            </Grid>
        </Grid >
    );
}
