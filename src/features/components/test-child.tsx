import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from '../../lib';
import { STATE_CHART, ON_ENTER_STATE_ACTIONS, MACHINE_OPTIONS, INITIAL_STATE, MachineState, MachineAction } from '../configs/test-child-machine';
import { StateValue } from 'xstate';

interface TestChildComponentProps extends StateMachineInjectedProps<{}> {
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
            case MachineState.START:
                return <button onClick={this.handleSubmit}>SUBMIT CHILD</button>;
            case MachineState.END:
                return <button onClick={onExit}>RESET PARENT</button>;
            default:
                return null;
        }
    }

    private handleSubmit = () => {
        const { dispatch } = this.props;
        dispatch(MachineAction.STOP);
    }
}

export const TestChildComponent = withStateMachine(
    TestChildBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE,
    ON_ENTER_STATE_ACTIONS
);
