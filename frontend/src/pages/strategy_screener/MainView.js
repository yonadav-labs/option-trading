import React, {useState, useEffect} from "react";
import { Grid, Button, TextField, Box } from "@material-ui/core";
import { Autocomplete, Pagination } from "@material-ui/lab/";
import NewTradeCard from "../../components/NewTradeCard";
import TickerAutocomplete from "../../components/TickerAutocomplete";
import FilterContainer from "../../components/filters/FilterContainer";


export default function MainView({allTickers, onTickerSelectionChange, bestStrategies }) {
    const [renderedStrategies, setRenderedStrategies] = useState([])
    const [noOfPages, setNoOfPages] = useState(null)

    const pageChangeHandler = (event, page) => {
        setRenderedStrategies(bestStrategies.slice((10 * (page-1)), (10 * page)))
    }

    useEffect(() => {
        setRenderedStrategies(bestStrategies.slice(0,10))
        setNoOfPages(Math.ceil(bestStrategies.length / 10))
    }, [bestStrategies])

    return (
        <div>
            <Grid container direction="row" justify="center" alignItems="stretch">
                <Grid item sm={2}>
                    <Box p={4} bgcolor='#333741' color="white" height="105%" style={{marginRight: '-2rem'}}>
                        <Grid container direction="column" justify="center" >
                            <FilterContainer/>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item sm={10}>
                    <Box p={2} style={{marginLeft: '2rem'}}>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <Grid item sm={2}>
                                <h5>ENTER TICKER SYMBOL</h5>
                            </Grid>
                            <Grid item sm={5}>
                                <TickerAutocomplete 
                                    tickers={allTickers}
                                    onChange={onTickerSelectionChange}
                                    size={'small'}
                                />
                            </Grid>
                            <Grid item sm={2}>
                                <h5>EXPIRATION DATES</h5>
                            </Grid>
                            <Grid item sm={3}>
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
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <Grid item> 
                                LAST PRICE
                                <br/>
                                $133.19
                            </Grid>
                            <Grid item>
                                DAY Range
                                <br/>
                                132.81 - 145.09
                            </Grid>
                            <Grid item>
                                52 WEEK RANGE
                                <br/>
                                53.15 - 145.09
                            </Grid>
                            <Grid item>
                                Market Cap
                                <br/>
                                $2.24T
                            </Grid>
                            <Grid item>
                                P/E Ratio
                                <br/>
                                36.12
                            </Grid>
                            <Grid item>
                                EPS
                                <br/>
                                $3.69
                            </Grid>
                            <Grid item>
                                Earning Date
                                <br/>
                                N/A
                            </Grid>
                            <Grid item>
                                Dividend Date
                                <br/>
                                N/A
                            </Grid>
                            <Grid item><Button>View Chart</Button></Grid>
                        </Grid>
                    </Box>
                    <Box p={5} bgcolor='#F2F2F2' minHeight="100vh" height="100%" style={{marginLeft: '2rem'}}>
                        <Grid container spacing={2} direction="column" justify="center" alignItems="stretch">
                            {renderedStrategies.map((strategy, index) => <NewTradeCard strategy={strategy} key={index}/>)}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            <Grid container justify="flex-end">
                <Pagination count={noOfPages} color="primary" onChange={pageChangeHandler}/>
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