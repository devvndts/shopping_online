import React, { Component } from 'react';
import MyContext from './MyContext';

const LS_TOKEN = 'admin.token';
const LS_USERNAME = 'admin.username';

function safeGet(key, fallback = '') {
  try {
    const v = window.localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

class MyProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      token: safeGet(LS_TOKEN, ''),
      username: safeGet(LS_USERNAME, ''),

      // functions
      setToken: this.setToken,
      setUsername: this.setUsername,
    };
  }

  setToken = (value) => {
    const v = value || '';
    if (v) safeSet(LS_TOKEN, v);
    else safeRemove(LS_TOKEN);
    this.setState({ token: v });
  };

  setUsername = (value) => {
    const v = value || '';
    if (v) safeSet(LS_USERNAME, v);
    else safeRemove(LS_USERNAME);
    this.setState({ username: v });
  };

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
