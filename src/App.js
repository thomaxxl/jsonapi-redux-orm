import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Ptest} from './JAConnect'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
<pre>{JSON.stringify(Ptest(), null, 2)}</pre>
        </p>
      </div>
    );
  }
}

export default App;