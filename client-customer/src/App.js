import "./App.css";
import React, { Component } from "react";
import Main from "./components/MainComponent";
import { BrowserRouter } from "react-router-dom";
import MyProvider from "./contexts/MyProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

class App extends Component {
  componentDidMount() {
    // Apply public site meta (title + favicon) from backend settings
    axios
      .all([
        axios.get("/api/customer/settings/site-title"),
        axios.get("/api/customer/settings/site-favicon"),
      ])
      .then(
        axios.spread((titleRes, favRes) => {
          const t = (titleRes && titleRes.data && titleRes.data.title
            ? String(titleRes.data.title)
            : ""
          ).trim();
          if (t) document.title = t;

          const faviconUrl = (favRes && favRes.data && favRes.data.imageUrl
            ? String(favRes.data.imageUrl)
            : ""
          ).trim();
          if (faviconUrl) {
            const existing =
              document.querySelector('link[rel="icon"]') ||
              document.querySelector('link[rel="shortcut icon"]');
            const link = existing || document.createElement("link");
            link.setAttribute("rel", "icon");
            link.setAttribute("href", faviconUrl);
            if (!existing) document.head.appendChild(link);
          }
        })
      )
      .catch(() => {
        // ignore (keep defaults in public/index.html)
      });
  }

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
