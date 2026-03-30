import './App.css';
import React, { Component } from 'react';
import MyProvider from './contexts/MyProvider';
import LoginWithNav from './components/LoginWithNav';
import Main from './components/MainComponent';
import { BrowserRouter } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <MyProvider>
        <BrowserRouter>
          <LoginWithNav />
          <Main />
        </BrowserRouter>
      </MyProvider>
    );
  }
}

export default App;
