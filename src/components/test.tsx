import * as React from 'react';
import { withStateMachine, InjectedProps } from '../state-machine-component';
import { TestComponentState, STATE_CHART, STATE_ACTIONS, INITIAL_STATE, MachineAction } from './test-machine';

interface TestComponentProps extends InjectedProps<TestComponentState> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

    public render() {
        const { currentState, context } = this.props;

        if (currentState) {
            return <div>
                <h1>{currentState.value}</h1>
                <ul>
                    {this.renderItems(context.items)}
                </ul>
                <button onClick={this.handleSubmit}>OK</button>
            </div>;
        }
        return null;
    }

    private renderItems(items: string[]) {
        return items.map((item, i) => <li key={i}>{item}</li>);

    }

    private handleSubmit = () => {
        this.props.dispatch(MachineAction.SUBMIT);
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    INITIAL_STATE,
    STATE_ACTIONS
);
