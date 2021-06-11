import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TickerAutocomplete from "../../components/TickerAutocomplete";
import TickerCard from "./TickerCard";
import { Button, Card, CardContent, Typography, Stack, useMediaQuery, Skeleton } from '@material-ui/core';
import colors from "../../colors";
import { getPopularTickers } from '../../utils';

const TickerSelectionCard = ({ allTickers, onChange, selectedTicker }) => {
    const [popularTickers, setPopularTickers] = useState([1, 2, 3, 4]);
    const [loadingPopularTickers, setLoadingPopularTickers] = useState(true);
    const [isNext, setNext] = useState(false);
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

    const handleNextButtonClick = () => {
        setNext(true);
    }

    const handleTickerCardClick = (t) => {
        const ticker = allTickers.filter(ticker => ticker.symbol === t.symbol);
        onChange(ticker[0]);
    }

    useEffect(() => {
        getPopularTickers({}).then((data) => {
            if (data) {
                setPopularTickers(data);
            }
            setLoadingPopularTickers(false)
        });
    }, [])

    return (
        <Card raised sx={{ p: `${isMobile ? "0px" : "20px"}`, borderRadius: 4 }}>
            <CardContent sx={{ minHeight: 432, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {isNext ?
                    <>
                        <Typography variant="h6" textAlign="center" mb={2}>
                            Would would you like to do with <span style={{ color: colors.orange }}>{`${selectedTicker ? selectedTicker.symbol : ''}`}</span>?
                        </Typography>
                        <Stack direction={isMobile ? "column" : "row"} spacing={2} maxWidth="100%" p={2}>
                            <Button variant="outlined" size="large" href={`/discover?symbol=${selectedTicker.symbol}`} to={`/discover?symbol=${selectedTicker.symbol}`} role="button">Find a Trade</Button>
                            <Button variant="outlined" size="large" href={`/build?symbol=${selectedTicker.symbol}`} to={`/build?symbol=${selectedTicker.symbol}`} role="button">Build a Strategy</Button>
                            <Button variant="outlined" size="large" href={`/screen?symbol=${selectedTicker.symbol}`} to={`/screen?symbol=${selectedTicker.symbol}`} role="button">Screen Options Chain</Button>
                            <Button variant="outlined" size="large" href={`/panorama?symbol=${selectedTicker.symbol}`} to={`/panorama?symbol=${selectedTicker.symbol}`} role="button">View unusual activity</Button>
                        </Stack>
                    </>
                    :
                    <>
                        <Typography variant="h6" textAlign="center" mb={2}>Which stock are you interested in?</Typography>
                        <TickerAutocomplete
                            tickers={allTickers}
                            onChange={(e, selected) => onChange(selected)}
                            value={selectedTicker}
                        />
                        <Button variant="contained" color="secondary" size="large" sx={{ my: 2 }} onClick={handleNextButtonClick} disabled={!selectedTicker}>
                            Next
                        </Button>
                        <Typography variant="subtitle1" textAlign="center" my={2}>Not sure? Here are today’s top stocks:</Typography>
                        <Stack direction="row" spacing={2} maxWidth="100%">
                            {popularTickers.map((ticker, index) => (
                                loadingPopularTickers ?
                                    <Skeleton variant="rectangular"><TickerCard /></Skeleton>
                                    :
                                    <TickerCard onClick={() => handleTickerCardClick(ticker)} ticker={ticker} />
                            ))}
                        </Stack>
                    </>
                }
            </CardContent>
        </Card>
    );
};

TickerSelectionCard.defaultProps = {
    children: null,
};

TickerSelectionCard.propTypes = {
    children: PropTypes.node,
};

export default TickerSelectionCard;
