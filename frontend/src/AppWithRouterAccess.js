import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Profile from './pages/Profile';
import Login from './components/Login';
import config from "./oktaConfig";
import Home from './pages/Home';
import Header from './components/header'
import Footer from './components/footer'
import Disclaimer from './components/disclaimer';

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
                <Header></Header>
                <div className="container">
                    <Security  {...config.oidc} onAuthRequired={this.onAuthRequired} >
                        <Switch>
                            <Route path='/' exact={true} component={Home} />
                            <SecureRoute path='/profile' component={Profile} />
                            <Route path="/disclaimer" component={Disclaimer}></Route>
                            <Route path='/login' component={Login} />
                            <Route path='/callback' component={LoginCallback} />
                        </Switch>
                    </Security>
                </div>
                <Footer></Footer>
            </div>
        );
    }
});