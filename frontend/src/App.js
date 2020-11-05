import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import './App.css';
import Home from './pages/Home';
import Disclaimer from './components/disclaimer'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Header from './components/header'
import Footer from './components/footer'
import Login from "./components/Login";
import { Security, SecureRoute, LoginCallback } from "@okta/okta-react";
import config from "./oktaConfig";
import Profile from './pages/Profile';

function App() {
  const history = createBrowserHistory();
  // Initialize google analytics page view tracking
  history.listen(location => {
    ReactGA.initialize('G-3LMHS8L17E');
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
  });

  function customAuthHandler() {
    history.push("/login");
  }

  return (
    <Router history={history}>
      <Header></Header>
      <div className="container">
        <Security {...config.oidc} onAuthRequired={customAuthHandler}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/disclaimer">
              <Disclaimer />
            </Route>
            <SecureRoute exact path="/profile" component={Profile} />
            <Route path="/login" component={Login} />
            {/* <SecureRoute path="/profile" exact component={Profile} /> */}
            <Route path="/callback" component={LoginCallback} />
          </Switch>
        </Security>
        <Footer></Footer>
      </div>
    </Router>
  );
}

export default App;
