import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from '../../lib';
import { STATE_CHART, ON_ENTER_STATE_ACTIONS, MACHINE_OPTIONS, INITIAL_STATE } from '../configs/test-child-machine';

interface TestChildComponentProps extends StateMachineInjectedProps<{}> {
    onExit: () => void;
}

export class TestChildBaseComponent extends React.PureComponent<TestChildComponentProps> {

    public render() {
        const { currentState, onExit } = this.props;
        const { value: currentStateName } = currentState;

        return <div className="test-child" ><h1>CHILD COMPONENT: {currentStateName}</h1><button onClick={onExit}>RESET PARENT</button></div>;
    }
}

export const TestChildComponent = withStateMachine(
    TestChildBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE,
    ON_ENTER_STATE_ACTIONS
);
