## React Xstate HOC
Integrates the Xstate lib with Reactjs. Please follow this link for more details about Xstate https://xstate.js.org/docs/

### HOW TO

Define your State Machine

```typescript
import { StateMachineAction, StateMachineOnEntryAction } from 'react-xstate-hoc';
import { assign } from 'xstate/lib/actions';

export interface TestComponentState {
    items: string[];
}

export const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    LIST: 'LIST',
    ERROR: 'ERROR',
    SHOW_ITEM: 'SHOW_ITEM',
    END: 'END'
}

export const MachineAction = {
    SUBMIT: 'SUBMIT',
    CANCEL: 'CANCEL',
    PROCESSED: 'PROCESSED',
    ERROR: 'ERROR',
    RESET: 'RESET',
    NONE: 'NONE'
}

export const STATE_CHART = {
    initial: 'START',
    states: {
        [MachineState.START]: {
            on: {
                SUBMIT: {
                    target: MachineState.PROCESSING
                }
            },
            onEntry: assign((ctx: TestComponentState) => ({ items: [] }))
        },
        [MachineState.PROCESSING]: {
            on: {
                PROCESSED: {
                    target: MachineState.LIST,
                    actions: assign((ctx: TestComponentState, e: StateMachineOnEntryAction<TestComponentState>) => {
                        const { data: { items } } = e;
                        return { items };
                    })
                },
                ERROR: 'ERROR'
            }
        },
        [MachineState.LIST]: {
            on: {
                RESET: MachineState.START,
                SELECT: 'SHOW_ITEM'
            }
        },
        [MachineState.SHOW_ITEM]: {
            on: {
                EXIT: MachineState.LIST
            }
        },
        [MachineState.ERROR]: {
            on: {
                RESET: MachineState.START
            }
        }
    }
};
```

You can even pass a dictionary of functions instead of assigning a function to `actions` attribute. In order to link the two, just add a `label` to `actions` in the config here above.


```typescript
export const MACHINE_OPTIONS = {
    actions: {
        resetContext: (ctx: TestComponentState, e: StateMachineOnEntryAction<TestComponentState>) => {
            // do something here
        },
        updateList: (ctx: TestComponentState, e: StateMachineOnEntryAction<TestComponentState>) => {
            // do something here
        }
    },
    guards: {
        checkStart: (ctx: TestComponentState) => {
            return ctx.items.length === 0;
        }
    }
};

```

### Async Actions on Enter

If you need to play with server side calls then add a configuration for those actions.

```typescript
// test only 
function fakeAJAX(params: Dictionary<string | number | boolean>) {
    return new Promise<string[]>((resolve, reject) => setTimeout(() => {
        const rnd = Math.random();
        if (rnd > 0.5) {
            reject();
        } else {
            resolve(['ok', ...Object.keys(params)]);
        }
    }, 1000)
    );
}

// onEnter actions
export const ON_ENTER_STATE_ACTIONS: StateMachineAction<TestComponentState> = new Map([
    [
        MachineState.PROCESSING,
        async (params: Dictionary<string | number | boolean>) => {
            let triggerAction = MachineAction.PROCESSED;
            let items: string[] = [];
            try {
                items = await fakeAJAX(params);
            } catch (e) {
                triggerAction = MachineAction.ERROR;
            }
            return {
                data: { items },
                triggerAction // please create an action on state machine config in order to reflect changes in context
            };
        }
    ]
]);
```


### My Component

Let's now link the component to the state machine using `withStateMachine`.

```typescript
import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps } from 'react-xstate-hoc';
import { TestComponentState, STATE_CHART, ON_ENTER_STATE_ACTIONS, MachineAction, MachineState, MACHINE_OPTIONS, INITIAL_STATE } from './test-machine';
import { StateValue } from 'xstate';

interface TestComponentProps extends StateMachineInjectedProps<TestComponentState> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

    public render() {
        const { currentState, context } = this.props;
        const { value: currentStateName } = currentState;

        return (<div>
            <h1>{currentStateName}</h1>
            <ul>
                {this.renderItems(context.items)}
            </ul>
            {this.renderButton(currentStateName)}
            <button onClick={this.handleSubmit}>SUBMIT</button>
        </div>);
    }

    private renderButton(currentStateName: StateValue) {
        switch (currentStateName) {
            case MachineState.START:
                return <button onClick={this.handleSubmit}>OK</button>;
            case MachineState.LIST:
                return <button onClick={this.handleReset}>RESET</button>;
            case MachineState.ERROR:
                return <button onClick={this.handleReset}>RE-START</button>;
            default:
                return null;
        }
    }

    private renderItems(items: string[]) {
        return items.map((item, i) => <li key={i}>{item}</li>);
    }

    private handleSubmit = () => {
        this.props.dispatch({ type: MachineAction.SUBMIT, extra: 'ok' });
    }

    private handleReset = () => {
        this.props.dispatch(MachineAction.RESET);
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    MACHINE_OPTIONS,
    INITIAL_STATE,
    ON_ENTER_STATE_ACTIONS
);


```
