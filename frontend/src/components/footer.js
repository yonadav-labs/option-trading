import React from "react";
import { Link } from "react-router-dom";
// import { FormControlLabel, Grid, Switch, Typography } from "@material-ui/core";
import { FaTwitter, FaFacebookSquare, FaInstagram, FaDiscord } from 'react-icons/fa';
import colors from "../colors";
import { makeStyles } from "@material-ui/styles";
import { Paper } from "@material-ui/core";

function Footer(props) {
    const useStyles = makeStyles({
        lightText: {
            color: colors.lightText
        }
    });

    const classes = useStyles();

    return (
        <Paper square sx={{ background: '#2A2A2A', p: 5 }}>
            {/* <hr className="featurette-divider-last" /> */}
            <footer className="featurette-divider-last">
                <div className="row">
                    <div className="col-md-4 col-12">
                        <h3 className="text-light">
                            Never get lost in the options chain again.
                        </h3>
                        <p className="text-light">
                            Contact us at contact@tigerstance.com or through this <a href="https://forms.gle/qEqcKb1mtG8PJUWq6" target="_blank">google form</a>.
                        </p>
                        <h4 className="text-light">
                            <a href="https://twitter.com/EaseandExtra" target="_blank"><FaTwitter /></a>&nbsp;
                            <a href="https://www.facebook.com/TigerStanceOfficial" target="_blank"><FaFacebookSquare /></a>&nbsp;
                            <a href="https://www.instagram.com/tigerstance_official" target="_blank"><FaInstagram /></a>&nbsp;
                            <a href="https://discord.gg/MJT5r4x9zK" target="_blank"><FaDiscord /></a>
                        </h4>
                    </div>
                    {/* <div className="col-md-2 col-6">
                        <h3 className="text-light">
                            Learn
                        </h3>
                        <p className="text-light">
                            Product
                        </p>
                        <p className="text-light">
                            Solutions
                        </p>
                        <p className="text-light">
                            Pricing
                        </p>
                    </div>
                    <div className="col-md-2 col-6">
                        <h3 className="text-light">
                            Company
                        </h3>
                        <p className="text-light">
                            About
                        </p>
                        <p className="text-light">
                            Contact
                        </p>
                        <p className="text-light">
                            Support
                        </p>
                    </div>
                    <div className="col-md-4 col-12">
                        <h3 className="text-light">
                            Stay up to date
                        </h3>
                        <p className="text-light">
                            Sign up to our newsletter to get notified about any and all brand updates and exclusive information.
                        </p>
                        <p className="text-light">
                            PUT EMAIL INPUT HERE
                        </p>
                    </div> */}
                </div>
                <hr />
                <div className="row">
                    <div className="col">
                        <p className="text-muted">
                            All content and data on tigerstance.com is for informational purposes only, you should not construe
                            any such information or other material as legal, tax, trading, investment, financial, or other advice.
                        See <Link to="/disclaimer" > full legal disclaimer</Link>.
                    </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p className="text-muted">
                            Data and information on tigerstance.com is provided 'as-is' and solely for informational purposes, not for trading purposes or advice, and is delayed.
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p className="text-muted">
                            Please see our <Link to="/privacy" >privacy policy</Link>.
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <small className="d-block text-muted">Copyright &copy; 2020-2021 tigerstance.com. All Rights Reserved.</small>
                    </div>
                </div>
            </footer>
        </Paper>
        // </div>
        // WIP CODE FOR NEW FOOTER BELOW
        // <footer>
        // <Grid
        //     mt={3}
        //     p={5}
        //     container
        //     direction="row"
        //     justifyContent="space-between"
        //     alignItems="center"
        //     style={{ background: "#333741" }}>
        //     <Grid container item spacing={3}>
        //         <Grid item md={4} sm={12} lg={5}>
        //             <Typography variant={"h5"} className={classes.lightText}>
        //                 Never get lost in the options chain again.
        //             </Typography>
        //             <Typography variant={"body1"} className={classes.lightText}>
        //                 Contact us at contact@tigerstance.com or through
        //                 this{" "}
        //                 <a
        //                     href="https://forms.gle/qEqcKb1mtG8PJUWq6"
        //                     target="_blank">
        //                     google form
        //                 </a>
        //                 .
        //             </Typography>
        //             <FormControlLabel
        //                 control={<Switch disabled />}
        //                 style={{ color: "#ccc" }}
        //                 label="Dark Mode"
        //             />

        //             <h4 className={classes.lightText}>
        //                 <a href="https://twitter.com/EaseandExtra" target="_blank"><FaTwitter /></a>&nbsp;
        //                <a href="https://www.facebook.com/TigerStanceOfficial" target="_blank"><FaFacebookSquare /></a>&nbsp;
        //                <a href="https://www.instagram.com/tigerstance_official" target="_blank"><FaInstagram /></a>&nbsp;
        //                <a href="https://discord.gg/MJT5r4x9zK" target="_blank"><FaDiscord /></a>
        //             </h4>
        //         </Grid>
        //         <Grid
        //             container
        //             item
        //             md={2}
        //             sm={6}
        //             direction="column"
        //             wrap="nowrap"
        //             spacing={2}>
        //             <Grid item zeroMinWidth>
        //                 <Typography variant={"h5"} className={classes.lightText}>
        //                     Learn
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Discover
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Screen
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Build
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Surface
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Reports
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Pricing
        //                 </Typography>
        //             </Grid>
        //         </Grid>
        //         <Grid
        //             container
        //             item
        //             md={2}
        //             sm={6}
        //             direction="column"
        //             wrap="nowrap"
        //             spacing={2}>
        //             <Grid item zeroMinWidth>
        //                 <Typography variant={"h5"} className={classes.lightText}>
        //                     Company
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     About
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <Typography
        //                     variant={"body2"}
        //                     className={classes.lightText}>
        //                     Contact
        //                 </Typography>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <a
        //                     href="https://www.instagram.com/tigerstance_official"
        //                     target="_blank">
        //                     <Typography
        //                         variant={"body2"}
        //                         className={classes.lightText}>
        //                         Twitter
        //                     </Typography>
        //                 </a>
        //             </Grid>
        //             <Grid item zeroMinWidth>
        //                 <a
        //                     href="https://discord.gg/MJT5r4x9zK"
        //                     target="_blank">
        //                     <Typography
        //                         variant={"body2"}
        //                         className={classes.lightText}>
        //                         Facebook
        //                     </Typography>
        //                 </a>
        //             </Grid>
        //         </Grid>
        //     </Grid>
        //     <hr
        //         style={{
        //             borderColor: "#656565",
        //             borderWidth: "1px",
        //             flex: 1,
        //             borderStyle: "solid"
        //         }}
        //     />
        //     <Grid container>
        //         <Grid item>
        //             <Typography variant={"footer"} className="text-muted">
        //                 All content and data on tigerstance.com is for
        //                 informational purposes only, you should not construe
        //                 any such information or other material as legal,
        //                 tax, trading, investment, financial, or other
        //                 advice. See{" "}
        //                 <Link to="/disclaimer"> full legal disclaimer</Link>
        //                 .
        //             </Typography>
        //         </Grid>
        //     </Grid>
        //     <Grid container item>
        //         <Grid item>
        //             <Typography variant={"footer"} className="text-muted">
        //                 Data and information on tigerstance.com is provided
        //                 'as-is' and solely for informational purposes, not
        //                 for trading purposes or advice, and is delayed.
        //             </Typography>
        //         </Grid>
        //     </Grid>
        //     <Grid container pb={4} item>
        //         <Grid item>
        //             <small className="d-block text-muted">
        //                 Copyright &copy; 2020-2021 tigerstance.com. All
        //                 Rights Reserved.
        //             </small>
        //         </Grid>
        //     </Grid>
        // </Grid>
        // </footer>
    );
}

export default Footer
