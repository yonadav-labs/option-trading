import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { OktaAuth } from '@okta/okta-auth-js';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Profile from './pages/Profile';
import Login from './components/Login';
import getOktaConfig from "./oktaConfig";
import Home from './pages/home/Home.js';
import Header from './components/header'
import Footer from './components/footer'
import Surface from './pages/surface/Surface'
import Disclaimer from './components/disclaimer';
import Privacy from './components/privacy';
import Generator from './pages/generator_tool/Generator';
import SingleTrade from './pages/SingleTrade';
import Pricing from './pages/Pricing';
import EmailVerified from './pages/EmailVerified';
import SignupSuccess from './pages/SignupSuccess';
import { Container, Toolbar } from '@material-ui/core';
import NewOptionScreener from './pages/option_screener/NewOptionScreener';
import NewBuild from './pages/build_tool/NewBuild';
import ScrollToTop from './components/ScrollToTop';

const oktaAuth = new OktaAuth(getOktaConfig().oidc);

export default withRouter(class AppWithRouterAccess extends Component {
    constructor(props) {
        super(props);
        this.onAuthRequired = this.onAuthRequired.bind(this);
    }

    onAuthRequired() {
        this.props.history.push('/signin');
    }

    render() {
        return (
            <Container disableGutters maxWidth='xl' sx={{ minHeight: '100vh' }}>
                <Security
                    oktaAuth={oktaAuth}
                    onAuthRequired={this.onAuthRequired}
                >
                    <Header />
                    <Toolbar />
                    <ScrollToTop>
                        <Switch>
                            <Route path='/' exact={true} component={Home} />
                            <Route path='/option-screener' exact={true} component={NewOptionScreener} />
                            <Route path='/browse' exact={true} component={NewOptionScreener} />
                            <Route path='/screen' exact={true} component={NewOptionScreener} />
                            <Route path='/screener' exact={true} component={NewOptionScreener} />
                            <Route path='/surface' exact={true} component={Surface} />
                            <Route path='/panorama' exact={true} component={Surface} />
                            <Route path='/heatmap' exact={true} component={Surface} />
                            <Route path='/discover' exact={true} component={Generator} />
                            <Route path='/generator' exact={true} component={Generator} />
                            <Route path='/strategy-screener' exact={true} component={Generator} />
                            <Route path='/t/:tradeId' exact={true} component={SingleTrade} />
                            <Route path='/strategy-builder' exact={true} component={NewBuild} />
                            <Route path='/build' exact={true} component={NewBuild} />
                            <Route path='/builder' exact={true} component={NewBuild} />
                            <SecureRoute path='/profile' component={Profile} />
                            <Route path="/disclaimer" component={Disclaimer}></Route>
                            <Route path="/privacy" component={Privacy}></Route>
                            <Route path='/signin' component={Login} />
                            <Route path='/signin/register' component={Login} />
                            <Route path='/verify-email' component={EmailVerified} />
                            <Route path='/signup-success' component={SignupSuccess} />
                            <Route path='/callback' component={LoginCallback} />
                            <Route path='/pricing' component={Pricing} />
                        </Switch>
                    </ScrollToTop>
                    <Footer />
                </Security>
            </Container>
        );
    }
});
