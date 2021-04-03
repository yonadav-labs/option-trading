import React, { useState } from "react";
import { Grid, Paper, Box, makeStyles, Button, Typography, Divider } from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TradeProfitLossGraph from "../TradeProfitLossGraph";
import LegDetailsCard from "./LegDetailsCard";
import MetricLabel from '../MetricLabel.js';
import {
    PriceFormatter, ProfitFormatter, getTradeTypeDisplay, PercentageFormatter,
    TimestampDateFormatter, TimestampTimeFormatter
} from '../../utils';

const useStyles = makeStyles(theme => ({
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

export default function NewTradeCard({ trade }) {
    const [moreInfo, setMoreInfo] = useState(false)

    const showMoreInfo = () => {
        setMoreInfo(!moreInfo);
    };
    const classes = useStyles();

    return (
        <Grid item sm={12}>
            <Paper elevation={2}>
                <Box p={2}>
                    <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Grid item xs={3}>
                            <Box p={2} my={-2} ml={-2} mr={2}>
                                <Typography variant="h4" className={classes.capitalize}><b>{getTradeTypeDisplay(trade.type)}</b></Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={9}>
                            <TableContainer component={Paper}>
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Action</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Type</TableCell>
                                            <TableCell align="right">Expiration Date</TableCell>
                                            <TableCell align="right">Strike</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {trade.legs.map((leg) => (
                                            <TableRow key={leg.name}>
                                                <TableCell component="th" scope="row">
                                                    {leg.is_long ? 'Long' : 'Short'}
                                                </TableCell>
                                                <TableCell align="right">{leg.units}</TableCell>
                                                {
                                                    leg.contract &&
                                                    <>
                                                        <TableCell align="right">{leg.contract.is_call ? 'Call' : 'Put'}</TableCell>
                                                        <TableCell align="right">{TimestampDateFormatter(leg.contract.expiration)}</TableCell>
                                                        <TableCell align="right">{PriceFormatter(leg.contract.strike)}</TableCell>
                                                    </>
                                                }
                                                {
                                                    leg.stock &&
                                                    <>
                                                        <TableCell align="right">Shares</TableCell>
                                                    </>
                                                }
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Box>
                <Box p={2}>
                    <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Grid item xs={2}>
                            <MetricLabel label="hypothetical profit" />
                            <Typography variant="paragraph">{PriceFormatter(trade.target_price_profit)}</Typography>
                            <br />
                            <Typography variant="smallParagraph" color="#828282">{ProfitFormatter(trade.target_price_profit_ratio)}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <MetricLabel label="break-even at" />
                            <Typography variant="paragraph">{PriceFormatter(trade.break_even_price)}</Typography>
                            <br />
                            <Typography variant="smallParagraph" color="#828282">{ProfitFormatter(trade.to_break_even_ratio)}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <MetricLabel label="cost" />
                            <Typography variant="paragraph">${trade.cost}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <MetricLabel label="profit limit" />
                            <Typography variant="paragraph">{trade.profit_cap ? `$${trade.profit_cap}` : 'UNLIMITED'}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <MetricLabel label="volume" />
                            <Typography variant="paragraph">{trade.min_volume}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <MetricLabel label="open interest" />
                            <Typography variant="paragraph">{trade.min_open_interest}</Typography>
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
                                <Grid item xs={2}>
                                    <MetricLabel label="notional value" />
                                    {PriceFormatter(trade.notional_value)}
                                </Grid>
                                <Grid item xs={2}>
                                    <MetricLabel label="leverage" />
                                    {PercentageFormatter(trade.leverage)}
                                </Grid>
                                <Grid item xs={2}>
                                    <MetricLabel label="5% chance loss" />
                                    {
                                        trade.two_sigma_profit_lower ?
                                            <>
                                                <Typography variant="paragraph">{PriceFormatter(trade.two_sigma_profit_lower)}</Typography>
                                                <br />
                                                <Typography variant="smallParagraph" color="#828282">{ProfitFormatter(trade.two_sigma_profit_lower_ratio)}</Typography>
                                            </>
                                            : "N/A"
                                    }
                                </Grid>
                                <Grid item xs={2}>
                                    <MetricLabel label="5% chance loss price" />
                                    {
                                        trade.two_sigma_profit_lower ?
                                            PriceFormatter(trade.two_sigma_profit_lower_price)
                                            : "N/A"
                                    }
                                </Grid>
                                <Grid item xs={2}>
                                    <MetricLabel label="quoted at" />
                                    {TimestampTimeFormatter(trade.quote_time)}
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
                                    <TradeProfitLossGraph trade={trade} />
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
                                    trade.legs.map((leg, index) => {
                                        return (
                                            <Grid item key={index} xs={12}>
                                                <LegDetailsCard key={index} leg={leg} leg_num={index + 1}></LegDetailsCard>
                                                {index < trade.legs.length - 1 ? <br /> : null}
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
