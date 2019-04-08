import * as React from 'react';
import './App.css';
import { v4 } from 'uuid';

import { TestComponent } from './features/components/test-base';
import { TestConnectedComponent } from './features/components/test-connected';

interface AppState {
  counter: string[];
}

class App extends React.Component<{}, AppState> {

  readonly state = {
    counter: ['first']
  }

  public render() {
    const { counter } = this.state;
    return (
      <div className="App">
        <h1>widthStateMachine</h1>
        <TestComponent label="LABEL_PROP" />
        <hr />
        <h1>connectStateMachine</h1>
        {this.renderConnectedComponents(counter)}
        <button onClick={this.handleAdd}>ADD CONNECTED</button>
      </div>
    );
  }

  public renderConnectedComponents(counter: string[]) {
    return counter.map(i => <TestConnectedComponent label={`CONNECTED-${i}`} />);
  }

  public handleAdd = () => {
    const { counter: stateCounter } = this.state;
    const counter = [...stateCounter, v4()];
    this.setState({ counter })
  }
}

export default App;
