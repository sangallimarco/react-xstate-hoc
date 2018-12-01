import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from '../../lib';
import { STATE_CHART, MACHINE_OPTIONS, INITIAL_STATE, TestChildMachineEvents } from '../configs/test-child-machine';
import { StateValue } from 'xstate';

interface TestChildComponentProps extends StateMachineInjectedProps<{}, TestChildMachineEvents> {
    onExit: () => void;
}

export class TestChildBaseComponent extends React.PureComponent<TestChildComponentProps> {

    public render() {
        const { currentState } = this.props;
        const { value: currentStateName } = currentState;

        return <div className="test-child" >
            <h1>CHILD COMPONENT: {currentStateName}</h1>
            {this.renderChild(currentStateName)}
        </div>;
    }

    private renderChild(currentStateName: StateValue) {
        const { onExit } = this.props;

        switch (currentStateName) {
            case 'asdad':
                return <button onClick={this.handleSubmit}>SUBMIT CHILD</button>;
            case 'END':
                return <button onClick={onExit}>RESET PARENT</button>;
            default:
                return null;
        }
    }

    private handleSubmit = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'STOP' });
    }
}

export const TestChildComponent = withStateMachine(
    TestChildBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE
);
