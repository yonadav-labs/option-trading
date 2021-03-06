import React from "react";
import { Link } from "@material-ui/core";
import { Divider, Grid, Typography } from "@material-ui/core";
import { FaTwitter, FaFacebookSquare, FaInstagram, FaDiscord } from 'react-icons/fa';
import { Paper } from "@material-ui/core";

export default function Footer(props) {
    return (
        <footer>
            <Paper square sx={{ background: '#2A2A2A', p: 5 }}>
                <Grid container direction="row">
                    <Grid container direction="column" pr={2}>
                        <Typography variant="h5" color="primary.contrastText" pb={1}>
                            Never get lost in the options chain again.
                        </Typography>
                        <Typography variant="body1" color="primary.contrastText" pb={2}>
                            Contact us at <Link rel="noopener noreferrer" href="mailto:contact@tigerstance.com">contact@tigerstance.com</Link> or through this <Link href="https://forms.gle/qEqcKb1mtG8PJUWq6" target="_blank" rel="noopener">google form</Link>.
                        </Typography>
                        <Typography variant="h5" pb={1}>
                            <Link href="https://www.facebook.com/TigerStanceOfficial" target="_blank" rel="noopener"><FaFacebookSquare /></Link>&nbsp;
                            <Link href="https://www.instagram.com/tigerstance_official" target="_blank" rel="noopener"><FaInstagram /></Link>&nbsp;
                            <Link href="https://twitter.com/TheTigerStance" target="_blank" rel="noopener"><FaTwitter /></Link>&nbsp;
                            <Link href="https://discord.gg/MJT5r4x9zK" target="_blank" rel="noopener"><FaDiscord /></Link>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider style={{ width: "100%", borderWidth: "1px", margin: "1rem 0", borderColor: "#4F4F4F" }} />
                <Grid container direction="row" pb={2}>
                    <Grid container direction="column">
                        <Typography variant="body2" color="primary.muted">
                            All content and data on tigerstance.com is for informational purposes only, you should not construe
                            any such information or other material as legal, tax, trading, investment, financial, or other advice.
                            See <Link href="/disclaimer" > full legal disclaimer</Link>.
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container direction="row" pb={2}>
                    <Grid container direction="column">
                        <Typography variant="body2" color="primary.muted">
                            Data and information on tigerstance.com is provided 'as-is' and solely for informational purposes,
                            not for trading purposes or advice, and is delayed by 15 minutes. <br />
                            Market data is provided by <Link href="https://iexcloud.io/">IEX Cloud</Link> and <Link href="https://intrinio.com/">Intrinio</Link>.
                            tigerstance.com is a licensed <Link href="https://www.opraplan.com/">OPRA</Link> vendor.
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container direction="row" pb={2}>
                    <Grid container direction="column">
                        <Typography variant="body2" color="primary.muted">
                            Please see our <Link href="/privacy" >privacy policy</Link>.
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container direction="row">
                    <Grid container direction="column">
                        <Typography variant="body2" color="primary.muted">Copyright &copy; 2020-2021 tigerstance.com. All Rights Reserved.</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </footer >
    );
}
