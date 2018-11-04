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

const MachineTrigger = {
    LOAD: 'LOAD'
}

interface Context {
    items: string[]
}

const CONTEXT: Context = {
    items: []
}

const STATE_CHART = {
    initial: MachineState.START,
    context: CONTEXT,
    states: {
        [MachineState.START]: {
            on: {
                [MachineAction.SUBMIT]: {
                    target: MachineState.PROCESSING,
                    actions: MachineTrigger.LOAD
                }
            }
        },
        [MachineState.PROCESSING]: {
            on: {
                [MachineAction.CANCEL]: {
                    target: MachineState.START,
                    actions: [MachineTrigger.LOAD]
                }
            }
        }
    }
}

const STATE_ACTIONS = {
    actions: {
        [MachineTrigger.LOAD]: (ctx: Context) => {
            setTimeout(() => {
                ctx.items = ['ok'];
            }, 2000);
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
