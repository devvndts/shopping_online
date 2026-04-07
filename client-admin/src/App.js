import './App.css';
import React, { Component } from 'react';
import MyProvider from './contexts/MyProvider';
import LoginWithNav from './components/LoginWithNav';
import Main from './components/MainComponent';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  render() {
    return (
      <MyProvider>
        <BrowserRouter>
          <LoginWithNav />
          <Main />
          <ToastContainer newestOnTop limit={4} />
        </BrowserRouter>
      </MyProvider>
    );
  }
}

export default App;
