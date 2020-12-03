import React, { useContext, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useOktaAuth } from '@okta/okta-react';
import UserContext from '../UserContext';
import getApiUrl from '../utils';

function Header() {
    const { authState, authService } = useOktaAuth();
    const { user, setUser } = useContext(UserContext);
    const API_URL = getApiUrl();

    useEffect(() => {
        if (!authState.isAuthenticated) {
            // When user isn't authenticated, forget any user info
            setUser(null);
        } else {
            const { accessToken } = authState;
            authService.getUser().then(info => {
                // console.log(info);
                fetch(`${API_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                    .then((response) => {
                        if (!response.ok) {
                            return Promise.reject();
                        }
                        return response.json();
                    })
                    .then((data) => {
                        // console.log(data);
                        setUser(data);
                    })
                    .catch((err) => {
                        /* eslint-disable no-console */
                        console.error(err);
                    });
                // getUser(info);
            });
        }
    }, [authState, authService]); // Update if authState changes

    async function logout() {
        authService.logout('/');
    }

    return (
        <header>
            <Navbar className="fixed-top" collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand as={Link} to="/">Tigerstance</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/buy-call">Buy call</Nav.Link>
                        <Nav.Link as={Link} to="/sell-covered-call">Sell covered call</Nav.Link>
                        <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    {authState.isAuthenticated ? <Nav><Nav.Link as={Link} to="/profile">Profile</Nav.Link></Nav> : null}
                    <Nav>
                        {authState.isAuthenticated ?
                            <Nav.Link href="#" onClick={logout}>Logout</Nav.Link>
                            :
                            <Nav.Link as={Link} to="/login">Sign Up / Login</Nav.Link>}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    );
}

export default Header