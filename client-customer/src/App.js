import "./App.css";
import React, { Component } from "react";
import Main from "./components/MainComponent";
import { BrowserRouter } from "react-router-dom";
import MyProvider from "./contexts/MyProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class App extends Component {
  render() {
    return (
      <MyProvider>
        <BrowserRouter>
          <Main />
          <ToastContainer
            position="top-right"
            newestOnTop
            limit={5}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
          />
        </BrowserRouter>
      </MyProvider>
    );
  }
}

export default App;
