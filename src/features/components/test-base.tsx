import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from '../../lib';
import { STATE_CHART, MACHINE_OPTIONS, INITIAL_STATE, TestMachineEvents, TestMachineStateSchema, TestMachineAction, TestMachineState } from '../configs/test-machine';
import { TestChildComponent } from './test-child';
import './test.css';
import { TestComponentState } from '../configs/test-types';

interface TestComponentProps extends StateMachineInjectedProps<TestComponentState, TestMachineStateSchema, TestMachineEvents> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

    public render() {
        const { currentState, context } = this.props;

        return (<div className="test">
            <h1>{currentState}</h1>
            <div>
                {this.renderChild(currentState, context)}
            </div>
        </div>);
    }

    private renderChild(currentStateValue: TestMachineState, context: TestComponentState) {
        switch (currentStateValue) {
            case TestMachineState.START:
                return <button onClick={this.handleSubmit}>OK</button>;
            case TestMachineState.LIST:
                return <div>
                    <div className="test-list">
                        {this.renderItems(context.items)}
                    </div>
                    <TestChildComponent onExit={this.handleReset} />
                </div>;
            case TestMachineState.ERROR:
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
        this.props.dispatch({ type: TestMachineAction.SUBMIT, extra: 'ok' });
    }

    private handleReset = () => {
        this.props.dispatch({ type: TestMachineAction.RESET });
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE
);
