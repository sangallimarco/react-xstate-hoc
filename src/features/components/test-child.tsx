import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from '../../lib';
import { STATE_CHART, INITIAL_STATE, TestChildMachineEvents, TestChildMachineStateSchema, TestChildActions, TestChildStates } from '../configs/test-child-machine';

interface TestChildComponentProps extends StateMachineInjectedProps<{}, TestChildMachineStateSchema, TestChildMachineEvents> {
    onExit: () => void;
}

export class TestChildBaseComponent extends React.PureComponent<TestChildComponentProps> {

    public render() {
        const { currentState } = this.props;

        return <div className="test-child" >
            <h2>CHILD COMPONENT: {currentState}</h2>
            {this.renderChild(currentState)}
        </div>;
    }

    private renderChild(currentStateName: TestChildStates) {
        const { onExit } = this.props;

        switch (currentStateName) {
            case TestChildStates.START:
                return <button onClick={this.handleSubmit}>SUBMIT CHILD</button>;
            case TestChildStates.END:
                return <button onClick={onExit}>RESET PARENT</button>;
            default:
                return null;
        }
    }

    private handleSubmit = () => {
        const { dispatch } = this.props;
        dispatch({ type: TestChildActions.STOP });
    }
}

export const TestChildComponent = withStateMachine(
    TestChildBaseComponent,
    STATE_CHART,
    INITIAL_STATE
);
