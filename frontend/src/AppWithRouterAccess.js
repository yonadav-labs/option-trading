import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { OktaAuth } from '@okta/okta-auth-js';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Profile from './pages/Profile';
import Login from './components/Login';
import getOktaConfig from "./oktaConfig";
import Home from './pages/Home';
import Header from './components/header'
import Footer from './components/footer'
import OptionScreener from './pages/OptionScreener'
import Surface from './pages/Surface'
import Disclaimer from './components/disclaimer';
import NewStrategyScreener from './pages/strategy_screener/NewStrategyScreener';
import SingleTrade from './pages/SingleTrade';
import Pricing from './pages/Pricing';
import StrategyBuilder from './pages/StrategyBuilder';
import EmailVerified from './pages/EmailVerified';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import { Container } from '@material-ui/core';
import NewOptionScreener from './pages/option_screener/NewOptionScreener';

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
                    <Header></Header>
                    <Switch>
                        <Route path='/' exact={true} component={Home} />
                        <Route path='/option-screener' exact={true} component={NewOptionScreener} />
                        <Route path='/browse' exact={true} component={NewOptionScreener} />
                        <Route path='/screen' exact={true} component={NewOptionScreener} />
                        <Route path='/surface' exact={true} component={Surface} />
                        <Route path='/panorama' exact={true} component={Surface} />
                        <Route path='/discover' exact={true} component={NewStrategyScreener} />
                        <Route path='/strategy-screener' exact={true} component={NewStrategyScreener} />
                        <Route path='/t/:tradeId' exact={true} component={SingleTrade} />
                        <Route path='/strategy-builder' exact={true} component={StrategyBuilder} />
                        <Route path='/build' exact={true} component={StrategyBuilder} />
                        <SecureRoute path='/profile' component={Profile} />
                        <Route path="/disclaimer" component={Disclaimer}></Route>
                        <Route path='/signin' component={Login} />
                        <Route path='/signin/register' component={Login} />
                        <Route path='/verify-email' component={EmailVerified} />
                        <Route path='/callback' component={LoginCallback} />
                        <Route path='/pricing' component={Pricing} />
                        <SecureRoute path='/reports/:blogId' exact={true} component={BlogDetail} />
                        <Route path='/reports' component={Blog} />
                    </Switch>
                    <Footer className="mt-auto"></Footer>
                </Security>
            </Container>
        );
    }
});