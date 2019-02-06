import * as React from 'react';
import { connectStateMachine, StateMachineConnectedProps } from '../../lib';
import './test.css';
import { TestConnectedInterpreter, TestConnectedMachineStateSchema, TestConnectedMachineEvent, TestConnectedMachineState, TestConnectedMachineAction, TestConnectedComponentState } from '../configs/test-connected-machine';

interface TestConnectedProps extends StateMachineConnectedProps<TestConnectedComponentState, TestConnectedMachineStateSchema, TestConnectedMachineEvent> {
    label: string;
}

export class TestConnectedBaseComponent extends React.PureComponent<TestConnectedProps> {

    public render() {
        const { currentState, context, label, stateHash } = this.props;
        const { cnt } = context;

        return (<div className="test">
            <h1>{currentState} {cnt} {label} {stateHash}</h1>
            <div>
                {this.renderChild(currentState, context)}
            </div>
        </div>);
    }

    private renderChild(currentStateValue: TestConnectedMachineState, context: TestConnectedComponentState) {
        switch (currentStateValue) {
            case TestConnectedMachineState.START:
                return <button onClick={this.handleSubmit}>LIST</button>;
            case TestConnectedMachineState.LIST:
                return <button onClick={this.handleReset}>RESET</button>;
            default:
                return null;
        }
    }

    private handleSubmit = () => {
        this.props.dispatch({ type: TestConnectedMachineAction.SUBMIT, cnt: 1 });
    }

    private handleReset = () => {
        this.props.dispatch({ type: TestConnectedMachineAction.RESET });
    }
}

export const TestConnectedComponent = connectStateMachine(
    TestConnectedBaseComponent,
    TestConnectedInterpreter
);
