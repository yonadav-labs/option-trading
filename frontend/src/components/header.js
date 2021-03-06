import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from "react-router-dom";
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from "react-router-dom";
import ReactGA from 'react-ga';
import LiveChat from 'react-livechat';
import {
    AppBar, Button, Drawer, Grid, IconButton, Menu, MenuItem, styled, Toolbar, useMediaQuery,
    Typography, Backdrop, CircularProgress
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import UserContext from '../UserContext';
import getApiUrl from '../utils';
import Referral from './Referral';

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const sessionid = getCookie('pinax-referral');

const CustomButton = styled(Button)(({ theme }) => ({
    width: "100%",
    justifyContent: "left",
    paddingLeft: 10,
    paddingRight: 10,
    [theme.breakpoints.down("md")]: {
        paddingLeft: 8
    },
}));

const NavButton = (props) => (
    <>
        <CustomButton variant="text" size="large" LinkComponent={RouterLink} {...props}>
            <Typography variant="subtitle1" color="black" sx={{ textTransform: "none" }}>{props.children}</Typography>
        </CustomButton>
        <hr style={{
            margin: 0, height: 3, border: "0 none",
            background: `${window.location.pathname == props.href ? "linear-gradient(90deg, #FF8F2B 0%, #FFD43A 100%)" : "transparent"}`
        }} />
    </>
);

function Header() {
    const { oktaAuth, authState } = useOktaAuth();
    const { user, setUser } = useContext(UserContext);
    const API_URL = getApiUrl();
    const history = useHistory();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [accountMenuAnchorEl, setAccountMenuAnchorEl] = React.useState(null);
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [referralOpen, setReferralOpen] = useState(false);

    // mobile responsiveness
    const isMobile = useMediaQuery(theme => theme.breakpoints.down("md"));
    const isCard = useMediaQuery(theme => theme.breakpoints.down('sm'));

    const handleReferralClickOpen = () => {
        setReferralOpen(true);
    };

    function trackPageView() {
        ReactGA.pageview(window.location.pathname + window.location.search);
        setDrawerOpen(false);
    }

    useEffect(() => {
        trackPageView();
        history.listen(trackPageView);
    }, [history]);

    useEffect(() => {
        if (!authState.isAuthenticated) {
            // When user isn't authenticated, forget any user info.
            setUser(null);
        } else {
            const { accessToken } = authState;
            fetch(`${API_URL}/users/me/?referral-sessionid=${sessionid}`, {
                headers: {
                    Authorization: `Bearer ${accessToken.accessToken}`,
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    setUser(data);
                    window.hj('identity', data.email);
                })
                .catch((err) => {
                    /* eslint-disable no-console */
                    console.error(err);
                });
        }
    }, [oktaAuth, authState]); // Update if authState changes

    async function logout() {
        oktaAuth.signOut();
        setShowBackdrop(false);
    }

    const toggleDrawer = () => {
        setDrawerOpen((prevState) => !prevState);
    }

    const handleAccountMenuOpen = (event) => {
        setAccountMenuAnchorEl(event.currentTarget);
    };

    const handleAccountMenuClose = () => {
        setAccountMenuAnchorEl(null);
    };

    const menuContent = (
        <Grid pt={1}
            container
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "flex-start" : "space-between"}
        >
            <Grid item>
                <NavButton href="/generator" to="/generator">Generator</NavButton>
            </Grid>
            <Grid item>
                <NavButton href="/builder" to="/builder">Builder</NavButton>
            </Grid>
            <Grid item>
                <NavButton href="/screener" to="/screener">Screener</NavButton>
            </Grid>
            <Grid item>
                <NavButton href="/heatmap" to="/heatmap">Heatmap</NavButton>
            </Grid>
            <Grid item>
                <NavButton href="/pricing" to="/pricing">Pricing</NavButton>
            </Grid>
            {!authState.isAuthenticated && isMobile &&
                <>
                    <Grid item>
                        <NavButton href="/signin" to="/signin">Log In</NavButton>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" size="large" href="/signin/register"
                            to="/signin/register">Sign up</Button>
                    </Grid>
                </>
            }
        </Grid >
    );

    return (
        <header>
            <AppBar square position="fixed" color="default" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Grid container justifyContent="space-between" alignItems="center" height="100%">
                        <Grid item>
                            <RouterLink to="/" style={{ height: "100%", display: "flex", alignItems: "center" }}>
                                <img src="/tigerstance-logo.png" width="175px" /></RouterLink>
                        </Grid>
                        {!isMobile &&
                            <Grid item>
                                {menuContent}
                            </Grid>
                        }
                        <Grid item>
                            {authState.isAuthenticated ?
                                <>
                                    {!isCard ?
                                        <Button onClick={handleReferralClickOpen} style={{ textTransform: 'capitalize' }}>
                                            Refer & Get 1 Month Free
                                        </Button>
                                        :
                                        null
                                    }
                                    <IconButton
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        color="inherit"
                                        onClick={handleAccountMenuOpen}
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                    <Menu
                                        anchorEl={accountMenuAnchorEl}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(accountMenuAnchorEl)}
                                        onClose={handleAccountMenuClose}
                                    >
                                        <MenuItem component={RouterLink} href="/profile" to="/profile" onClick={handleAccountMenuClose}>
                                            Profile
                                        </MenuItem>
                                        <MenuItem onClick={() => { logout(); handleAccountMenuClose(); setShowBackdrop(true); }}>
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                                :
                                <>
                                    {!isMobile &&
                                        <Grid container item pt={1} columnSpacing={1}>
                                            <Grid item>
                                                <NavButton href="/signin" to="/signin">Log In</NavButton>
                                            </Grid>
                                            <Grid item>
                                                <Button variant="contained" size="large" href="/signin/register"
                                                    to="/signin/register">Sign up</Button>
                                            </Grid>
                                        </Grid>
                                    }
                                </>
                            }
                            {isMobile &&
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    aria-label="menu"
                                    aria-haspopup="true"
                                    onClick={toggleDrawer}
                                >
                                    <MenuIcon />
                                </IconButton>
                            }
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar >
            <Drawer
                anchor="right"
                open={drawerOpen && isMobile}
                sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }}
            >
                <Toolbar />
                {menuContent}
            </Drawer>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
                open={showBackdrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {
                user ?
                    <LiveChat license={12791829} visitor={{ name: user.nick_name || user.email, email: user.email }} />
                    :
                    <LiveChat license={12791829} />
            }

            {
                user ?
                    <Referral
                        referralLink={user.referral_link}
                        openStatus={referralOpen}
                        setOpenStatus={setReferralOpen}> </Referral>
                    :
                    <div></div>
            }
        </header >
    );
}

export default Header
