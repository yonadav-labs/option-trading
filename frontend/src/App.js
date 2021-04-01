import React, { useState } from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";
import ReactGA from 'react-ga';
import './App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import AppWithRouterAccess from './AppWithRouterAccess';
import UserContext from './UserContext';
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from './theme';

// My personal UA tracking code. Move to G tracking code once ReactGA is compatible with that.
// https://stackoverflow.com/questions/62135901/reactga-not-working-for-g-type-tracking-id
ReactGA.initialize('UA-40188247-2');

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
