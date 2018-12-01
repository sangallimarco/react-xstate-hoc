import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from '../../lib';
import { STATE_CHART, MACHINE_OPTIONS, INITIAL_STATE, TestMachineEvents } from '../configs/test-machine';
import { StateValue } from 'xstate';
import { TestChildComponent } from './test-child';
import './test.css';
import { TestComponentState } from '../types/test-types';

interface TestComponentProps extends StateMachineInjectedProps<TestComponentState, TestMachineEvents> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

    public render() {
        const { currentState, context } = this.props;
        const { value: currentStateValue } = currentState;

        return (<div className="test">
            <h1>{currentStateValue}</h1>
            <div>
                {this.renderChild(currentStateValue, context)}
            </div>
        </div>);
    }

    private renderChild(currentStateValue: StateValue, context: TestComponentState) {
        switch (currentStateValue) {
            case '':
                return <button onClick={this.handleSubmit}>OK</button>;
            case 'LIST':
                return <div>
                    <div className="test-list">
                        {this.renderItems(context.items)}
                    </div>
                    <TestChildComponent onExit={this.handleReset} />
                </div>;
            case 'ERROR':
                return <div className="test-error-box">
                    <button onClick={this.handleReset}>RESET</button>
                </div>;
            default:
                return null;
        }
    }

    private renderItems(items: string[]) {
        return items.map((item, i) => <div className="test-list-item" key={i}>{item}</div>);
    }

    private handleSubmit = () => {
        this.props.dispatch({ type: 'SUBMIT', extra: 'ok' });
    }

    private handleReset = () => {
        this.props.dispatch({ type: 'RESET' });
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE
);
