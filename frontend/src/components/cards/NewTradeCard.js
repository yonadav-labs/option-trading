import React, { useState } from "react";
import { Grid, Paper, Box, makeStyles, Button, Typography, Divider } from "@material-ui/core";
import TradeProfitLossGraph from "../TradeProfitLossGraph";
import LegDetailsCard from "./LegDetailsCard";

const useStyles = makeStyles(theme => ({
    borderRight: {
        borderRight: "1px solid #E4E4E4"
    },
    viewMoreButton: {
        border: "1px solid #E4E4E4",
        borderRadius: "22px",
        background: "#FFFFFF",
        "&:focus": {
            outline: "none"
        },
        "& .MuiButton-label": {
            font: "500 14px Roboto",
            color: "#FF902B",
        },
    },
    horizontalLine: {
        borderBottom: "1px solid #E4E4E4",
        flex: '1 1 auto'
    },
    capitalize: {
        textTransform: "capitalize"
    }
}))

export default function NewTradeCard({ strategy }) {
    const [moreInfo, setMoreInfo] = useState(false)

    const showMoreInfo = () => {
        setMoreInfo(!moreInfo)
    }
    const classes = useStyles()

    return (
        <Grid item sm={12}>
            <Paper elevation={2}>
                <Box p={2}>
                    <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Grid item xs={2}>
                            <Box p={2} my={-2} ml={-2} mr={2} bgcolor="#FFF1E4" className={classes.borderRight}>
                                <Typography variant="h5" className={classes.capitalize}>{strategy.type.replace(/_/g, ' ')}</Typography>
                                <br />
                                <Typography variant="title">
                                    04/16/2021: $1000 <br />
                                    04/23/2021: $1100 <br />
                                    Debit
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="label">hypothetical profit</Typography>
                            <br />
                            <Typography variant="paragraph">${strategy.target_price_profit}</Typography>
                            <br />
                            <Typography variant="smallParagraph" color="#828282">+{strategy.target_price_profit_ratio * 100}%</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="label">BREAK-EVEN</Typography>
                            <br />
                            <Typography variant="paragraph">At ${strategy.break_even_price}</Typography>  {/* have to dynamically change + or - */}
                            <br />
                            <Typography variant="smallParagraph" color="#828282">+{strategy.to_break_even_ratio * 100}%</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="label">COST / MAX LOSS</Typography>
                            <br />
                            <Typography variant="paragraph">${strategy.cost}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="label">MAX PROFIT</Typography>
                            <br />
                            <Typography variant="paragraph">{strategy.profit_cap ? `$${strategy.profit_cap}` : 'UNLIMITED'}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="label">LIQUIDITY</Typography>
                            <br />
                            <Typography variant="paragraph">VOLUME: {strategy.min_volume}</Typography>
                            <br />
                            <Typography variant="smallParagraph" color="#828282">OPEN : {strategy.min_open_interest}</Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '-21px' }}>
                    <span className={classes.horizontalLine} />
                    <Button className={classes.viewMoreButton} onClick={showMoreInfo}>{moreInfo ? 'View Less' : 'View More'}</Button>
                    <span className={classes.horizontalLine} />
                </Box>

                {/* show more info */}
                {moreInfo ?
                    <>
                        <Box p={2}>
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                            >
                                <Grid item>
                                    <Typography variant="h6">Overview</Typography>
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                            >
                                <Grid item sm={4}>
                                    <Typography variant="label" color="primary">TARGET PRICE RANGE</Typography>
                                    <br />
                                    <Typography variant="paragraph">$0.00 (-100%) - $65.02 (+100%)</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="label" color="primary">HYPOTHETICAL PROFIT</Typography>
                                    <br />
                                    <Typography variant="paragraph">$19,690.29(+18X)</Typography>
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                            >
                                <Grid item sm={4}>
                                    <Typography variant="label" color="primary">BREAK-EVEN AT</Typography>
                                    <br />
                                    <Typography variant="paragraph">${strategy.break_even_price} ({(strategy.to_break_even_ratio * 100).toFixed(2)}%)</Typography>
                                </Grid>
                                <Grid item sm={4}>
                                    <Typography variant="label" color="primary">PROFIT LIMIT</Typography>
                                    <br />
                                    <Typography variant="paragraph">{strategy.profit_cap ? `$${strategy.profit_cap}` : 'UNLIMITED'}</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="label" color="primary">COST/MAX LOSS</Typography>
                                    <br />
                                    <Typography variant="paragraph">${strategy.cost}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                        <Divider></Divider>
                        {/* trade profit graph */}
                        <Box p={2}>
                            <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignContent="center"
                            >
                                <Grid item xs={12}>
                                    <TradeProfitLossGraph trade={strategy} />
                                </Grid>
                            </Grid>
                        </Box>
                        {/* leg details */}
                        <Box p={2} bgcolor="#f5f6f6">
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                            >
                                {
                                    strategy.legs.map((leg, index) => {
                                        return (
                                            <Grid item key={index} xs={12}>
                                                <LegDetailsCard key={index} leg={leg} leg_num={index + 1}></LegDetailsCard>
                                                {index < strategy.legs.length - 1 ? <br /> : null}
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        </Box>
                    </>
                    :
                    null
                }
            </Paper>
        </Grid>
    );
}
