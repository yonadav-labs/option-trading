import React, {useState} from "react";
import { Container, Grid, Paper, TextField, Box, Button } from "@material-ui/core";
import {
    Autocomplete,
    ToggleButtonGroup,
    ToggleButton,
} from "@material-ui/lab/";

export default function LandingView() {
    const [sentiment, setSentiment] = useState('bullish');

    const handleSentiment = (event, newSentiment) => {
        setSentiment(newSentiment);
    };

    return (
        <Container className="min-vh-100">
            <Grid container direction="row" justify="center" alignItems="center" >
                <Grid item>
                    <h1>Strategy Screener</h1>
                </Grid>
            </Grid>
            <br />
            <Grid container direction="row" justify="center" alignItems="center" >
                <Grid item xs={7}>
                    <p style={{ textAlign: "center" }}>
                        {" "}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Quis auctor elit sed vulputate mi sit amet
                        mauris. Ligula ullamcorper malesuada proin libero nunc
                        consequat interdum.{" "}
                    </p>
                </Grid>
            </Grid>
            <br />
            <Grid container direction="row" justify="center" alignItems="center" >
                <Grid item xs={6} align="center">
                    <Paper elevation={3}>
                        <Box p={4}>
                            <Grid container>
                                <Grid item>
                                    <h4> Enter Ticker Symbol </h4>
                                </Grid>
                            </Grid>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        id="ticker-select"
                                        options={top100Films}
                                        getOptionLabel={(option) =>
                                            option.title
                                        }
                                        fullWidth
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                placeholder="Enter a ticker symbol: TSLA, AAPL, GOOG..."
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container direction="row" justify="center" spacing={3} >
                                <Grid item xs={6}>
                                    <h4>Option Expiration Date</h4>
                                    <Autocomplete
                                        id="expiration-dates"
                                        multiple
                                        options={top100Films}
                                        getOptionLabel={(option) =>
                                            option.title
                                        }
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
                                <Grid item xs={6}>
                                    <h4>How are you feeling?</h4>
                                    <ToggleButtonGroup
                                        value={sentiment}
                                        exclusive
                                        onChange={handleSentiment}
                                        size="large"
                                    >
                                        <ToggleButton value="bullish">
                                            Bullish
                                        </ToggleButton>
                                        <ToggleButton value="bearish">
                                            Bearish
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container direction="row" justify="center" spacing={3} >
                                <Grid item xs={4}>
                                    <Button variant="contained" color="primary" size="large">
                                        Search
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const top100Films = [
    { title: "The Shawshank Redemption", year: 1994 },
    { title: "The Godfather", year: 1972 },
    { title: "The Godfather: Part II", year: 1974 },
    { title: "The Dark Knight", year: 2008 },
    { title: "12 Angry Men", year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: "Pulp Fiction", year: 1994 },
    { title: "The Lord of the Rings: The Return of the King", year: 2003 },
    { title: "The Good, the Bad and the Ugly", year: 1966 },
    { title: "Fight Club", year: 1999 },
    { title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001 },
    { title: "Star Wars: Episode V - The Empire Strikes Back", year: 1980 },
    { title: "Forrest Gump", year: 1994 },
    { title: "Inception", year: 2010 },
    { title: "The Lord of the Rings: The Two Towers", year: 2002 },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { title: "Goodfellas", year: 1990 },
    { title: "The Matrix", year: 1999 },
    { title: "Seven Samurai", year: 1954 },
    { title: "Star Wars: Episode IV - A New Hope", year: 1977 },
    { title: "City of God", year: 2002 },
    { title: "Se7en", year: 1995 },
    { title: "The Silence of the Lambs", year: 1991 },
    { title: "It's a Wonderful Life", year: 1946 },
    { title: "Life Is Beautiful", year: 1997 },
    { title: "The Usual Suspects", year: 1995 },
    { title: "Léon: The Professional", year: 1994 },
    { title: "Spirited Away", year: 2001 },
    { title: "Saving Private Ryan", year: 1998 },
    { title: "Once Upon a Time in the West", year: 1968 },
    { title: "American History X", year: 1998 },
    { title: "Interstellar", year: 2014 },
];