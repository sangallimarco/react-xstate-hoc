import * as React from 'react';
import { withStateMachine, InjectedProps } from '../state-machine-component';
import { actions } from 'xstate';
const { raise } = actions;

const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    LIST: 'LIST',
    END: 'END'
}

const MachineAction = {
    SUBMIT: 'SUBMIT',
    CANCEL: 'CANCEL',
    AUTO: 'AUTO'
}

const MachineTrigger = {
    LOAD: 'LOAD',
    FAKE_LOAD: 'FAKE_LOAD'
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
                    actions: [
                        MachineTrigger.LOAD
                    ]
                }
            }
        },
        [MachineState.PROCESSING]: {
            on: {
                [MachineAction.AUTO]: {
                    target: MachineState.LIST,
                    actions: []
                }
            }
        },
        [MachineState.LIST]: {
            on: {
                [MachineAction.CANCEL]: {
                    target: MachineState.START
                }
            }
        }
    }
}

// test only 
function fakeAJAX() {
    return new Promise<string[]>(resolve => setTimeout(() => {
        resolve(['ok']);
    }, 2000)
    );
}

const STATE_ACTIONS = {
    actions: {
        [MachineTrigger.LOAD]: async (ctx: Context) => {
            const res = await fakeAJAX();
            ctx.items = res;
            raise(MachineAction.AUTO);
        },
        [MachineTrigger.FAKE_LOAD]: (ctx: Context) => { ctx.items = ['ok'] }
    }
}

interface TestComponentProps extends InjectedProps<Context> {
    label?: string;
}

export class TestBaseComponent extends React.Component<TestComponentProps, {}> {

    public render() {
        const { currentState, context } = this.props;

        if (currentState && context) {
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

export const TestComponent = withStateMachine(TestBaseComponent, STATE_CHART, STATE_ACTIONS);
