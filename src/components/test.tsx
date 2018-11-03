import * as React from 'react';
import { withStateMachine, InjectedProps } from '../state-machine-component';

const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    END: 'END'
}

const MachineAction = {
    SUBMIT: 'SUBMIT',
    CANCEL: 'CANCEL'
}

const STATE_CHART = {
    initial: MachineState.START,
    states: {
        [MachineState.START]: {
            on: {
                [MachineAction.SUBMIT]: MachineState.PROCESSING
            },
            onEntry: 'sayHello'
        },
        [MachineState.PROCESSING]: {
            on: {
                [MachineAction.CANCEL]: MachineState.START
            },
            onEntry: 'sayCiao'
        }
    }
}

interface TestComponentProps {
    label?: string;
}

export class TestBaseComponent extends React.Component<TestComponentProps & InjectedProps, {}> {

    public render() {
        const { currentState } = this.props;

        if (currentState) {
            return <div>
                {currentState.value}
                <button onClick={this.handleSubmit}>OK</button>
            </div>;
        }
        return null;
    }

    private handleSubmit = () => {
        this.props.dispatch(MachineAction.SUBMIT);
    }
}

export const TestComponent = withStateMachine(TestBaseComponent, STATE_CHART);
