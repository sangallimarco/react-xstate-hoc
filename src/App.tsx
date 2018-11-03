import * as React from 'react';
import './App.css';

import { TestComponent } from './components/test';

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
