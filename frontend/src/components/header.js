import React, { useContext, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Navbar, Nav, Image } from 'react-bootstrap';
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from "react-router-dom";
import ReactGA from 'react-ga';
import UserContext from '../UserContext';
import getApiUrl from '../utils';
import '../index.css';

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
            fetch(`${API_URL}/users/me/`, {
                headers: {
                    Authorization: `Bearer ${accessToken.accessToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    setUser(data);
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
                    <Image src="/logo192.png" style={{ 'height': '1.5rem', 'paddingRight': '0.2rem' }} />
                    Tigerstance
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto justify-content-center" style={{ flex: 1 }}>
                        <Nav.Link eventKey={"1"} className="text-dark" as={Link} to="/discover">Discover</Nav.Link>
                        <Nav.Link eventKey={"2"} className="text-dark" as={Link} to="/build">Build</Nav.Link>
                        <Nav.Link eventKey={"3"} className="text-dark" as={Link} to="/browse">Browse</Nav.Link>
                        <Nav.Link eventKey={"4"} className="text-dark" as={Link} to="/blogs">Reports</Nav.Link>
                        <Nav.Link eventKey={"5"} className="text-dark" as={Link} to="/pricing">Pricing</Nav.Link>
                    </Nav>
                    {authState.isAuthenticated ?
                        <Nav>
                            <Nav.Link className="text-dark" as={Link} to="/profile">Profile</Nav.Link>
                            <Nav.Link className="text-dark" href="#" onClick={logout}>Logout</Nav.Link>
                        </Nav>
                        :
                        <Nav>
                            <Nav.Link className="text-dark" href="/signin">Log In</Nav.Link>
                            <Nav.Link className="btn-primary text-light signup-sm btn-gradient" href="/signin/register">Sign Up, It’s Free</Nav.Link>
                        </Nav>
                    }
                </Navbar.Collapse>
            </Navbar>
        </header>
    );
}

export default Header