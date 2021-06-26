import React, { useState } from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";
import ReactGA from 'react-ga';
import './App.css';
import AppWithRouterAccess from './AppWithRouterAccess';
import UserContext from './UserContext';
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from './theme';
import { hotjar } from 'react-hotjar';

// My personal UA tracking code. Move to G tracking code once ReactGA is compatible with that.
// https://stackoverflow.com/questions/62135901/reactga-not-working-for-g-type-tracking-id
ReactGA.initialize('UA-40188247-2', {
  debug: window.location.origin === "http://localhost:3000",
  gaOptions: {
    siteSpeedSampleRate: 100
  }
});

hotjar.initialize(2380490, 6);

function App() {
  const [user, setUser] = useState(null);
  const value = { user, setUser };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContext.Provider value={value}>
        <Router>
          <AppWithRouterAccess />
        </Router>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;
