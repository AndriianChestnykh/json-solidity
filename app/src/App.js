import React, { Component } from "react";
import { DrizzleProvider } from "drizzle-react";
import { LoadingContainer } from "drizzle-react-components";

import drizzleOptions from "./drizzleOptions";
import LogicContainer from './components/Logic'
import store from './middleware';
import logo from "./logo.png";

class App extends Component {
  render() {
    return (
      <div>
        <img src={logo} alt="drizzle-logo" height="40" width="40" />
        <DrizzleProvider store={store} options={drizzleOptions}>
          <LoadingContainer>
            <LogicContainer/>
          </LoadingContainer>
        </DrizzleProvider>
      </div>
    );
  }
}

export default App;
