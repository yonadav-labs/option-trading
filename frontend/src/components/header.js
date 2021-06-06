import React, { useContext, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Navbar, Nav, Image } from 'react-bootstrap';
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from "react-router-dom";
import ReactGA from 'react-ga';
import UserContext from '../UserContext';
import getApiUrl from '../utils';
import '../index.css';
import LiveChat from 'react-livechat'

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

function Header() {
    const { oktaAuth, authState } = useOktaAuth();
    const { user, setUser } = useContext(UserContext);
    const API_URL = getApiUrl();
    const history = useHistory();

    function trackPageView() {
        ReactGA.pageview(window.location.pathname + window.location.search);
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
    }

    return (
        <header>
            <Navbar collapseOnSelect expand="lg">
                <Navbar.Brand as={Link} to="/" className="font-weight-bold">
                    <Image src="/gold-logo.png" style={{ 'height': '2.3rem', 'paddingRight': '0.3rem', 'paddingBottom': '0.7rem' }} />
                    Tigerstance
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto justify-content-center" style={{ flex: 1 }}>
                        <Nav.Link eventKey={"1"} className="text-dark" as={Link} to="/discover">Discover</Nav.Link>
                        <Nav.Link eventKey={"2"} className="text-dark" as={Link} to="/build">Build</Nav.Link>
                        <Nav.Link eventKey={"3"} className="text-dark" as={Link} to="/screen">Screen</Nav.Link>
                        <Nav.Link eventKey={"4"} className="text-dark" as={Link} to="/panorama">Panorama</Nav.Link>
                        <Nav.Link eventKey={"5"} className="text-dark" as={Link} to="/reports">Reports</Nav.Link>
                        <Nav.Link eventKey={"6"} className="text-dark" as={Link} to="/pricing">Pricing</Nav.Link>
                    </Nav>
                    {authState.isAuthenticated ?
                        <Nav>
                            <Nav.Link className="text-dark" as={Link} to="/profile">Profile</Nav.Link>
                            <Nav.Link className="text-dark" href="#" onClick={logout}>Logout</Nav.Link>
                        </Nav>
                        :
                        <Nav>
                            <Nav.Link className="text-dark" href="/signin">Log In</Nav.Link>
                            <Nav.Link className="btn-primary text-light signup-sm btn-gradient" href="/signin/register">Sign Up for Free</Nav.Link>
                        </Nav>
                    }
                </Navbar.Collapse>
            </Navbar>
            {user ?
                <LiveChat license={'12791829'} visitor={{ name: user.nick_name || user.email, email: user.email }} />
                :
                <LiveChat license={'12791829'} />
            }
        </header>
    );
}

export default Header