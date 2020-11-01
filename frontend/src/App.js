import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import Home from './pages/Home';
import Disclaimer from './components/disclaimer'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Header from './components/header'
import Footer from './components/footer'

function App() {
  return (
    <Router>
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
