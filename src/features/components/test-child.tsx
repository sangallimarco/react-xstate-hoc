import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps, StateMachineStateName } from '../../lib';
import { STATE_CHART, MACHINE_OPTIONS, INITIAL_STATE, TestChildMachineEvents, TestChildMachineStateSchema } from '../configs/test-child-machine';

interface TestChildComponentProps extends StateMachineInjectedProps<{}, TestChildMachineStateSchema, TestChildMachineEvents> {
    onExit: () => void;
}

export class TestChildBaseComponent extends React.PureComponent<TestChildComponentProps> {

    public render() {
        const { currentState } = this.props;

        return <div className="test-child" >
            <h1>CHILD COMPONENT: {currentState}</h1>
            {this.renderChild(currentState)}
        </div>;
    }

    private renderChild(currentStateName: StateMachineStateName<TestChildMachineStateSchema>) {
        const { onExit } = this.props;

        switch (currentStateName) {
            case 'START':
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
