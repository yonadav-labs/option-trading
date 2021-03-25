import React, {useState, useEffect} from "react";
import { Grid, TextField, Box } from "@material-ui/core";
import { Autocomplete, Pagination } from "@material-ui/lab/";
import NewTradeCard from "../../components/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterContainer from "../../components/filters/FilterContainer";
import NewTickerSummary from "../../components/NewTickerSummary";

export default function MainView({ allTickers, onTickerSelectionChange, bestStrategies, basicInfo }) {
    const [renderedStrategies, setRenderedStrategies] = useState([])
    const [noOfPages, setNoOfPages] = useState(null)

    const pageChangeHandler = (event, page) => {
        setRenderedStrategies(bestStrategies.slice((10 * (page - 1)), (10 * page)))
    }

    useEffect(() => {
        setRenderedStrategies(bestStrategies.slice(0, 10))
        setNoOfPages(Math.ceil(bestStrategies.length / 10))
    }, [bestStrategies])

    return (
        <div>
            <Grid container direction="row" justify="center" alignItems="stretch">
                <Grid item sm={2}>
                    <Box p={4} boxShadow={3} bgcolor='#333741' color="white" height="105%" style={{marginRight: '-2rem'}}>
                        <Grid container direction="column" justify="center" className="filter-label">
                            <FilterContainer />
                        </Grid>
                    </Box>
                </Grid>
                <Grid item sm={10}>
                    <Box boxShadow={4} p={2} style={{ marginLeft: '2rem' }}>
                        <Box py={2}>
                            <Grid container direction="row" justify="center" alignItems="center">
                                <Grid item sm={2}>
                                    <span className="main-selection">ENTER TICKER SYMBOL</span>
                                </Grid>
                                <Grid item sm={6}>
                                    <TickerAutocomplete
                                        tickers={allTickers}
                                        onChange={onTickerSelectionChange}
                                        size={'small'}
                                    />
                                </Grid>
                                <Grid item sm={2} style={{ paddingLeft: '1rem' }}>
                                    <span className="main-selection">EXPIRATION DATE</span>
                                </Grid>
                                <Grid item sm={2}>
                                    <Autocomplete
                                        id="expiration-dates"
                                        multiple
                                        options={options}
                                        size="small"
                                        fullWidth
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Select an expiration date"
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box py={3}>
                            <NewTickerSummary basicInfo={basicInfo}/>
                        </Box>
                    </Box>
                    <Box p={5} bgcolor='#F2F2F2' minHeight="100vh" height="100%" style={{ marginLeft: '2rem' }}>
                        <Grid container spacing={2} direction="column" justify="center" alignItems="stretch">
                            {renderedStrategies.map((strategy, index) => <NewTradeCard strategy={strategy} key={index} />)}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            <Grid container justify="flex-end">
                <Pagination count={noOfPages} color="primary" onChange={pageChangeHandler} />
            </Grid>
        </div>
    );
}

const options = [
    'hello',
    'world',
    'apple',
    'tesla'
]