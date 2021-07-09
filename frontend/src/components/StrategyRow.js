import React, { useState } from 'react'
import { useHistory } from "react-router-dom";
import { Button, Chip, Grid, Typography, useTheme, Card, CardActionArea, Collapse, CardContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

export default function StrategyRow({ strategy, onStrategySelectionChange, disabled }) {
    let history = useHistory()
    const theme = useTheme();
    const useStyles = makeStyles({
        chip: {
            "&.MuiChip-root .MuiChip-label": {
                padding: 0
            }
        }
    }, theme);
    const classes = useStyles();

    const [expanded, setExpanded] = useState(false)
    const [imgExpanded, setImgExpanded] = useState(false)

    const expandRow = () => {
        setExpanded(!expanded)
        if (expanded === false) {
            setTimeout(() => {
                setImgExpanded(!imgExpanded)
            }, 200);
        } else { setImgExpanded(!imgExpanded) }
    }

    const chipMaker = (value) => {
        switch (value) {
            case "bullish":
                return <Chip label={<div><TrendingUpIcon /> <Typography variant="chip">bullish</Typography> </div>} className={classes.chip} style={{ width: 105 }} />
            case "bearish":
                return <Chip label={<div><TrendingDownIcon /> <Typography variant="chip">bearish</Typography> </div>} className={classes.chip} style={{ width: 105 }} />
            case "neutral":
                return <Chip label={<div><TrendingFlatIcon /> <Typography variant="chip">neutral</Typography> </div>} className={classes.chip} style={{ width: 105 }} />
            case "volatile":
                return <Chip label={<div><TrendingUpIcon /> <Typography variant="chip">volatile</Typography> </div>} className={classes.chip} style={{ width: 105 }} />
            case "basic":
                return <Chip label={<Typography variant="chip">basic</Typography>} className={classes.chip} style={{ width: 105, backgroundColor: "#DDFFFA", color: "#006868" }} />
            case "spreads":
                return <Chip label={<Typography variant="chip">spreads</Typography>} className={classes.chip} style={{ width: 105, backgroundColor: "#FFF3B7", color: "#755400" }} />
            case "advanced":
                return <Chip label={<Typography variant="chip">advanced</Typography>} className={classes.chip} style={{ width: 105, backgroundColor: "#FFF2F3", color: "#65252B" }} />
            case "loss":
                return <Chip label={<Typography variant="chip">unlimited loss</Typography>} className={classes.chip} style={{ width: 130, backgroundColor: "#DC3545", color: "#FFFFFF" }} />

            default:
                break;
        }
    }

    return (
        <>
            <Card onClick={expandRow} style={disabled ? { backgroundColor: "#f3f3f3" } : null}>
                <CardActionArea>
                    <Grid container p={2} justifyContent="space-between">
                        <Grid item xs={0} style={{ height: 50 }}></Grid>
                        <Grid item xs={6.5}>
                            <Grid container justifyContent="space-between">
                                <Grid item xs={4} pt={1}>
                                    <Typography variant="h5">{strategy.name}</Typography>
                                </Grid>
                                <Grid item xs={8} pt={1}>
                                    {strategy.sentiment.map(sentiment => chipMaker(sentiment))}
                                    {chipMaker(strategy.level)}
                                    {strategy.unlimitedLoss && chipMaker("loss")}
                                </Grid>
                            </Grid>
                            <Collapse in={expanded} timeout={200} unmountOnExit>
                                <br />
                                <CardContent style={{ padding: 0, height: 180 }}>
                                    <Typography variant="body2">
                                        {strategy.description}
                                    </Typography>
                                </CardContent>
                            </Collapse>
                        </Grid>
                        <Grid item xs={3.2}>
                            {/* {imgExpanded ?
                                <img
                                    src={`/${strategy.expandedGraph}`}
                                    alt="expanded graph"
                                    height="auto"
                                    width="100%"
                                />
                                :
                                <img
                                    src={`/${strategy.basicGraph}`}
                                    alt="simple graph"
                                    height="auto"
                                    width="100%"
                                />
                            } */}
                        </Grid>
                        <Grid item xs={1.7} pt={1}>
                            {
                                disabled ?
                                    <>
                                        <Button variant="outlined" color="warning" onClick={() => history.push("/pricing")}><Typography variant="button" color="warning.main"> Go Pro! </Typography></Button>
                                    </>
                                    :
                                    <>
                                        <Button variant="outlined" onClick={() => onStrategySelectionChange(strategy)}><Typography variant="button">Start Building</Typography></Button>
                                    </>
                            }
                        </Grid>
                        <Grid item xs={0.3} pt={1}>
                            {!expanded ? <ExpandMoreIcon color="primary" /> : <ExpandLessIcon color="primary" />}
                        </Grid>
                    </Grid>
                </CardActionArea>
            </Card>
        </>
    )
}
