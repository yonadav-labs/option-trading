import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Profile from './pages/Profile';
import Login from './components/Login';
import getOktaConfig from "./oktaConfig";
import Home from './pages/Home';
import Header from './components/header'
import Footer from './components/footer'
import SellCoveredCall from './components/SellCoveredCall'
import Disclaimer from './components/disclaimer';
import BestCallByPrice from './components/BestCallByPrice';

export default withRouter(class AppWithRouterAccess extends Component {
    constructor(props) {
        super(props);
        this.onAuthRequired = this.onAuthRequired.bind(this);
    }

    onAuthRequired() {
        this.props.history.push('/login')
    }

    render() {
        return (
            <div>
                <Security  {...(getOktaConfig().oidc)} onAuthRequired={this.onAuthRequired} >
                    <Header></Header>
                    <main role="main">
                        <Switch>
                            <Route path='/' exact={true} component={Home} />
                            <Route path='/buy-call' exact={true} component={BestCallByPrice} />
                            <Route path='/sell-covered-call' exact={true} component={SellCoveredCall} />
                            <SecureRoute path='/profile' component={Profile} />
                            <Route path="/disclaimer" component={Disclaimer}></Route>
                            <Route path='/signin' component={Login} />
                            <Route path='/signin/register' component={Login} />
                            <Route path='/callback' component={LoginCallback} />
                        </Switch>
                        <Footer></Footer>
                    </main>
                </Security>
            </div>
        );
    }
});