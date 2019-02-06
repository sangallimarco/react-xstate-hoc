import * as React from 'react';
import './App.css';

import { TestComponent } from './features/components/test-base';
import { TestConnectedComponent } from './features/components/test-connected';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <h1>widthStateMachine</h1>
        <TestComponent label="LABEL_PROP" />
        <h1>connectStateMachine</h1>
        <TestConnectedComponent label="CONNECTED" />
        <TestConnectedComponent label="CONNECTED2" />
      </div>
    );
  }
}

export default App;
