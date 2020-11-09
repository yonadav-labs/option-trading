import React from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import './App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import AppWithRouterAccess from './AppWithRouterAccess';

function App() {
  const history = createBrowserHistory();
  // Initialize google analytics page view tracking
  history.listen(location => {
    ReactGA.initialize('G-3LMHS8L17E');
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
  });

  return (
    <Router>
      <AppWithRouterAccess/>
    </Router>
  );
}

export default App;
