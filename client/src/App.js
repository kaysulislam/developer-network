import React, { Fragment } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//REDUX
import { Provider } from 'react-redux';

import store from './store';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
//REDUX

const App = () => (
  <Provider store={store}>
    <Router>
      <Fragment>
        <Navbar />
        <section className="container">
          <Routes>
            <Route exact path="/" element={<Landing />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/login" element={<Login />} />
          </Routes>{' '}
        </section>
      </Fragment>
    </Router>
  </Provider>
);

export default App;
