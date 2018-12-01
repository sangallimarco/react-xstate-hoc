import * as React from 'react';
import './App.css';

import { TestComponent } from './features/components/test-base';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <TestComponent />
      </div>
    );
  }
}

export default App;
