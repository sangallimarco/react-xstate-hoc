import * as React from 'react';
import { withStateMachine, InjectedProps } from '../state-machine-component';
import { TestComponentState, STATE_CHART, STATE_ACTIONS, INITIAL_STATE, MachineAction, MachineState } from './test-machine';
import { StateValue } from 'xstate';

interface TestComponentProps extends InjectedProps<TestComponentState> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

    public render() {
        const { currentState, context } = this.props;

        if (currentState) {
            const { value } = currentState;
            return <div>
                <h1>{value}</h1>
                <ul>
                    {this.renderItems(context.items)}
                </ul>
                {this.renderButton(value)}

            </div>;
        }
        return null;
    }

    private renderButton(currentState: StateValue) {
        switch (currentState) {
            case MachineState.START:
                return <button onClick={this.handleSubmit}>OK</button>;
            case MachineState.LIST:
                return <button onClick={this.handleReset}>RESET</button>;
            default:
                return null;
        }
    }

    private renderItems(items: string[]) {
        return items.map((item, i) => <li key={i}>{item}</li>);

    }

    private handleSubmit = () => {
        this.props.dispatch(MachineAction.SUBMIT);
    }

    private handleReset = () => {
        this.props.dispatch(MachineAction.RESET);
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    INITIAL_STATE,
    STATE_ACTIONS
);
