import React, { useState } from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import './App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import AppWithRouterAccess from './AppWithRouterAccess';
import UserContext from './UserContext';

function App() {
  const [user, setUser] = useState(null);
  const value = { user, setUser };
  const history = createBrowserHistory();
  // Initialize google analytics page view tracking
  history.listen(location => {
    ReactGA.initialize('G-3LMHS8L17E');
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
  });

  return (
    <UserContext.Provider value={value}>
      <Router>
        <AppWithRouterAccess />
      </Router>
    </UserContext.Provider>
  );
}

export default App;
