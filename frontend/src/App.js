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

function App() {
  const history = createBrowserHistory();
  // Initialize google analytics page view tracking
  history.listen(location => {
    ReactGA.initialize('G-3LMHS8L17E');
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
  });

  return (
    <Router history={history}>
      <Header></Header>
      <div class="container">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/disclaimer">
            <Disclaimer />
          </Route>
        </Switch>
        <Footer></Footer>
      </div>
    </Router>
  );
}

export default App;
