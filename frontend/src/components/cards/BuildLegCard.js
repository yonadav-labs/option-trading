import { Card, CardContent, CardHeader, Collapse, Grid, IconButton, styled, Typography, useMediaQuery } from '@material-ui/core';
import React, { useState } from 'react';
import { PriceFormatter, TimestampDateFormatter } from '../../utils';
import MetricLabel from '../MetricLabel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NewContractCard from './NewContractCard';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function BuildLegCard(props) {
    const { leg, index } = props;
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
    const [expanded, setExpanded] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleExpandClick = (e) => {
        e.stopPropagation();
        setExpanded(!expanded)
    }

    const mouseEnter = () => {
        setHovered(true)
    }

    const mouseExit = () => {
        setHovered(false)
    }

    const simpleInfo = (
        <Grid container spacing={1}>
            {leg.contract ?
                <>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="button"><MetricLabel label="contract" /></Typography>
                        <Typography variant="body1">
                            {TimestampDateFormatter(leg.contract.expiration)} {PriceFormatter(leg.contract.strike)} {leg.contract.is_call ? 'Call' : 'Put'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="action" /></Typography>
                        <Typography variant="body1">{leg.is_long ? 'Long' : 'Short'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="quantity" /></Typography>
                        <Typography variant="body1">{leg.units}</Typography>
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="premium" /></Typography>
                        <Typography variant="body1">{PriceFormatter(leg.cost_per_share)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="volume" /></Typography>
                        <Typography variant="body1">{leg.contract.volume}</Typography>
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="open interest" /></Typography>
                        <Typography variant="body1">{leg.contract.open_interest}</Typography>
                    </Grid>
                    {isMobile ? <Grid item xs={6} sm></Grid> : null}
                </>
                :
                <>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="type" /></Typography>
                        <Typography variant="body1">{leg.stock ? 'Share' : 'Cash'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="action" /></Typography>
                        {leg.stock ? <Typography variant="body1">{leg.is_long ? 'Long' : 'Short'}</Typography>
                            : <Typography variant="body1">Hold as collateral</Typography>}
                    </Grid>
                    <Grid item xs={6} sm>
                        <Typography variant="button"><MetricLabel label="quantity" /></Typography>
                        <Typography variant="body1">{leg.units}</Typography>
                    </Grid>
                    <Grid item xs={6} sm></Grid>
                    <Grid item xs={6} sm></Grid>
                    <Grid item xs={6} sm></Grid>
                </>}
        </Grid>
    );

    return (
        <Card sx={{ boxShadow: "none" }} onClick={handleExpandClick}>
            <CardHeader
                onMouseEnter={mouseEnter} onMouseLeave={mouseExit}
                style={hovered ? { backgroundColor: "#d3d3d3" } : null}
                disableTypography
                title={isMobile ? <Typography variant="h6">Leg {index + 1}</Typography> : null}
                avatar={!isMobile ? <Typography variant="h6">Leg {index + 1}</Typography> : null}
                subheader={!isMobile ? simpleInfo : null}
                action={leg.contract ?
                    <ExpandMore
                        expand={expanded}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon color="primary" />
                    </ExpandMore>
                    :
                    <IconButton sx={{ width: "48px" }} disabled></IconButton>}
            />
            {isMobile ?
                <CardContent>
                    {simpleInfo}
                </CardContent>
                : null}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <NewContractCard contract={leg.contract} sx={{ backgroundColor: 'rgba(228, 228, 228, 0.2)' }} />
            </Collapse>
        </Card>
    );
}