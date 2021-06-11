import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Card,
    CardActionArea,
    CardContent,
    Grid,
    Popover,
    Typography,
    useMediaQuery
} from "@material-ui/core";
import colors from "../../colors";
import { useState } from "react";


const TickerCard = ({ ticker, onClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Card>
                <CardActionArea sx={{ height: "100%", width: "100%" }} onClick={onClick ? onClick : handlePopoverOpen}>
                    <CardContent sx={{ height: `${isMobile ? "55px" : "80px"}`, width: `${isMobile ? "55px" : "80px"}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h6" color={colors.orange}>
                            {ticker ? ticker.symbol : null}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Popover
                PaperProps={{
                    onMouseLeave: handlePopoverClose
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "center"
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Grid container direction="column" justifyContent="center" alignItems="center" p={2} rowSpacing={1}>
                    <Grid item>
                        <Typography variant="h5" color={colors.orange}>
                            {ticker ? ticker.symbol : null}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="subtitle1" textAlign="center">{ticker.company_name}</Typography>
                    </Grid>
                    <Grid container direction="row" justifyContent="center" item spacing={1}>
                        <Grid item>
                            <Button variant="outlined" size="large" href={`/discover?symbol=${ticker.symbol}`} to={`/discover?symbol=${ticker.symbol}`} role="button">Discover</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" size="large" href={`/build?symbol=${ticker.symbol}`} to={`/build?symbol=${ticker.symbol}`} role="button">Build</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" size="large" href={`/screen?symbol=${ticker.symbol}`} to={`/screen?symbol=${ticker.symbol}`} role="button">Screen</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" size="large" href={`/panorama?symbol=${ticker.symbol}`} to={`/panorama?symbol=${ticker.symbol}`} role="button">Panorama</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Popover>
        </>
    );
};

TickerCard.defaultProps = {
    ticker: { symbol: "" },
    isMobile: false,
    onClick: null
};

TickerCard.propTypes = {
    children: PropTypes.node,
    ticker: PropTypes.object,
    ticker: PropTypes.element.isRequired,
    onClick: PropTypes.func
};

export default TickerCard;
