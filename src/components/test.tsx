import * as React from 'react';
import { withStateMachine, InjectedProps } from '../state-machine-component';
import { TestComponentState, STATE_CHART, ON_ENTER_STATE_ACTIONS, MachineAction, MachineState, MACHINE_OPTIONS, INITIAL_STATE } from './test-machine';
import { StateValue } from 'xstate';

interface TestComponentProps extends InjectedProps<TestComponentState> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

    public render() {
        const { currentState, context } = this.props;
        const { value: currentStateName } = currentState;

        return (<div>
            <h1>{currentStateName}</h1>
            <ul>
                {this.renderItems(context.items)}
            </ul>
            {this.renderButton(currentStateName)}
            <button onClick={this.handleSubmit}>SUBMIT</button>
        </div>);
    }

    private renderButton(currentStateName: StateValue) {
        switch (currentStateName) {
            case MachineState.START:
                return <button onClick={this.handleSubmit}>OK</button>;
            case MachineState.LIST:
                return <button onClick={this.handleReset}>RESET</button>;
            case MachineState.ERROR:
                return <button onClick={this.handleReset}>RE-START</button>;
            default:
                return null;
        }
    }

    private renderItems(items: string[]) {
        return items.map((item, i) => <li key={i}>{item}</li>);
    }

    private handleSubmit = () => {
        this.props.dispatch({ type: MachineAction.SUBMIT, extra: 'ok' });
    }

    private handleReset = () => {
        this.props.dispatch(MachineAction.RESET);
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE,
    ON_ENTER_STATE_ACTIONS
);
