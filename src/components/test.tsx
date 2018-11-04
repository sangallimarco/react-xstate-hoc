import * as React from 'react';
import { withStateMachine, InjectedProps } from '../state-machine-component';

enum MachineState {
    START = 'START',
    PROCESSING = 'PROCESSING',
    END = 'END'
}

enum MachineAction {
    SUBMIT = 'SUBMIT',
    CANCEL = 'CANCEL'
}

enum MachineTrigger {
    LOAD = 'LOAD'
}

const STATE_CHART = {
    initial: MachineState.START,
    states: {
        [MachineState.START]: {
            on: {
                [MachineAction.SUBMIT]: MachineState.PROCESSING
            },
            onEntry: MachineTrigger.LOAD
        },
        [MachineState.PROCESSING]: {
            on: {
                [MachineAction.CANCEL]: MachineState.START
            },
            onEntry: MachineTrigger.LOAD
        }
    }
}

const STATE_ACTIONS = {
    actions: {
        [MachineTrigger.LOAD]: () => {
            console.log('ok!');
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

export const TestComponent = withStateMachine(TestBaseComponent, STATE_CHART, STATE_ACTIONS);
