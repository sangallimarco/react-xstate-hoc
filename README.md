## React Xstate HOC
Integrates the Xstate lib with Reactjs. Please follow this link for more details about Xstate https://xstate.js.org/docs/

## Example
Please find the example here: https://github.com/sangallimarco/react-xstate-hoc/tree/master/src/features

Example includes a better usage of Types for Actions and States.


### HOW TO

Define your State Machine

```typescript
// file: configs/test-machine.ts

import { StateMachineAction } from 'react-xstate-hoc';
import { assign } from 'xstate/lib/actions';
import { MachineConfig } from 'xstate-ext';

export interface TestComponentState {
    items: string[];
}

export interface TestMachineStateSchema {
    states: {
        START: {};
        PROCESSING: {};
        LIST: {};
        ERROR: {};
        SHOW_ITEM: {};
    }
}

export type TestMachineEvents =
    | { type: 'SUBMIT', extra: string }
    | { type: 'CANCEL' }
    | { type: 'RESET' }
    | { type: 'SELECT' }
    | { type: 'EXIT' };

export const STATE_CHART: MachineConfig<TestComponentState, TestMachineStateSchema, TestMachineEvents> = {
    id: 'test',
    initial: 'START',
    states: {
        START: {
            on: {
                SUBMIT: {
                    target: 'PROCESSING',
                    cond: (ctx: TestComponentState) => {
                        return ctx.items.length === 0;
                    }
                }
            },
            onEntry: assign({
                items: []
            })
        },
        PROCESSING: {
            invoke: {
                src: 'FETCH_DATA',
                onDone: {
                    target: 'LIST',
                    actions: assign({
                        items: (ctx: TestComponentState, event: StateMachineAction<TestComponentState>) => {
                            return event.data.items;
                        }
                    })
                },
                onError: {
                    target: 'ERROR'
                    // error: (ctx, event) => event.data
                }
            }
        },
        LIST: {
            on: {
                RESET: 'START',
                SELECT: 'SHOW_ITEM'
            }
        },
        SHOW_ITEM: {
            on: {
                EXIT: 'LIST'
            }
        },
        ERROR: {
            on: {
                RESET: 'START'
            }
        }
    }
};

export const INITIAL_STATE: TestComponentState = {
    items: []
};


```

### Async Actions

If you need to play with server side calls then add a configuration for those actions.

```typescript
// file: services/test-service.ts

import { StateMachineAction } from 'react-xstate-hoc';
import { omit } from 'lodash';
import { fakeAJAX } from '../mocks/ajax';
import { TestComponentState } from '../configs/test-types';

export function fakeAJAX(params: Record<string, string | number | boolean>) {
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

export async function fetchData(e: StateMachineAction<TestComponentState>) {
    const params = omit(e, 'type');
    let items: string[] = [];
    try {
        items = await fakeAJAX(params);
        return { items };
    } catch (e) {
        throw new Error('Something Wrong');
    }
}

```


### My Component

Let's now link the component to the state machine using `withStateMachine`.

```typescript
// file: test-base.tsx

import * as React from 'react';
import { withStateMachine, StateMachineInjectedProps, StateMachineStateName } from 'react-xstate-hoc';
import { STATE_CHART, INITIAL_STATE, TestMachineEvents, TestMachineStateSchema, TestComponentState } from '../configs/test-machine';
import { fetchData } from '../services/test-service'; // described here below
import './test.css';

interface TestComponentProps extends StateMachineInjectedProps<TestComponentState, TestMachineStateSchema, TestMachineEvents> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

     constructor(props: TestComponentProps) {
        super(props);
        const { injectMachineOptions } = props;

        // Injecting options from component
        injectMachineOptions({
            services: {
                FETCH_DATA: (ctx: TestComponentState, e: TestMachineEventType) => fetchData(e) //here you can link a component internal method or provide a service from props
            }
        });
    }

    public render() {
        const { currentState, context } = this.props;

        return (<div className="test">
            <h1>{currentState}</h1>
            <div>
                {this.renderChild(currentState, context)}
            </div>
        </div>);
    }

    private renderChild(currentStateValue: StateMachineStateName<TestMachineStateSchema>, context: TestComponentState) {
        switch (currentStateValue) {
            case 'START':
                return <button onClick={this.handleSubmit}>OK</button>;
            case 'LIST':
                return <div>
                    <div className="test-list">
                        {this.renderItems(context.items)}
                    </div>
                </div>;
            case 'ERROR':
                return <div className="test-error-box">
                    <button onClick={this.handleReset}>RESET</button>
                </div>;
            default:
                return null;
        }
    }

    private renderItems(items: string[]) {
        return items.map((item, i) => <div className="test-list-item" key={i}>{item}</div>);
    }

    private handleSubmit = () => {
        this.props.dispatch({ type: 'SUBMIT', extra: 'ok' });
    }

    private handleReset = () => {
        this.props.dispatch({ type: 'RESET' });
    }
}

export const TestComponent = withStateMachine(
    TestBaseComponent,
    STATE_CHART,
    INITIAL_STATE
);

```

### Provide options to machine

See https://xstate.js.org/docs/guides/machines.html#options


You can link the machine definition action or service label to your component using  `injectMachineOptions`.
The function is available in your component props:

```typescript
// TestBaseComponent class constructor

...
constructor(props: TestComponentProps) {
        super(props);
        const { injectMachineOptions } = props;

        // Injecting options from component
        injectMachineOptions({
            services: {
                FETCH_DATA: (ctx: TestComponentState, e: TestMachineEventType) => fetchData(e) //here you can link a component internal method or provide a service from props
            },
            actions: {
                ... // your code here
            }
        });
    }
...
```

### Using enums

You can also use enums for states, actions, schema ...

```typescript
import { assign, log } from 'xstate/lib/actions';
import { MachineConfig } from 'xstate-ext';
import { StateMachineAction, MachineOptionsFix } from 'react-xstate-hoc';

export interface TestComponentState {
    items: string[];
    cnt: number;
}

export enum TestMachineState {
    START = 'START',
    PROCESSING = 'PROCESSING',
    LIST = 'LIST',
    ERROR = 'ERROR',
    SHOW_ITEM = 'SHOW_ITEM'
}

export enum TestMachineAction {
    SUBMIT = 'SUBMIT',
    CANCEL = 'CANCEL',
    RESET = 'RESET',
    SELECT = 'SELECT',
    EXIT = 'EXIT'
}

export interface TestMachineStateSchema {
    states: {
        [TestMachineState.START]: {};
        [TestMachineState.PROCESSING]: {};
        [TestMachineState.LIST]: {};
        [TestMachineState.ERROR]: {};
        [TestMachineState.SHOW_ITEM]: {};
    }
}

export type TestMachineEvents =
    | { type: TestMachineAction.SUBMIT, extra: string }
    | { type: TestMachineAction.CANCEL }
    | { type: TestMachineAction.RESET }
    | { type: TestMachineAction.SELECT }
    | { type: TestMachineAction.EXIT };

export type TestMachineEventType = StateMachineAction<TestComponentState>;

export enum TestMachineService {
    FETCH_DATA = 'FETCH_DATA'
}

export const STATE_CHART: MachineConfig<TestComponentState, TestMachineStateSchema, TestMachineEvents> = {
    id: 'test',
    initial: TestMachineState.START,
    states: {
        [TestMachineState.START]: {
            on: {
                [TestMachineAction.SUBMIT]: {
                    target: TestMachineState.PROCESSING,
                    cond: (ctx: TestComponentState) => ctx.cnt < 10 // run N times
                }
            },
            onEntry: assign({
                items: []
            })
        },
        [TestMachineState.PROCESSING]: {
            invoke: {
                src: TestMachineService.FETCH_DATA, // see injectMachineOptions here above
                onDone: {
                    target: TestMachineState.LIST,
                    actions: assign({
                        items: (ctx: TestComponentState, e: TestMachineEventType) => {
                            return e.data.items;
                        }
                    })
                },
                onError: {
                    target: TestMachineState.ERROR,
                    actions: log((ctx: TestComponentState, e: TestMachineEventType) => e.data)
                }
            }
        },
        [TestMachineState.LIST]: {
            on: {
                [TestMachineAction.RESET]: TestMachineState.START,
                [TestMachineAction.SELECT]: TestMachineState.SHOW_ITEM
            },
            onEntry: assign({
                cnt: (ctx: TestComponentState) => ctx.cnt + 1
            })
        },
        [TestMachineState.SHOW_ITEM]: {
            on: {
                [TestMachineAction.EXIT]: TestMachineState.LIST
            }
        },
        [TestMachineState.ERROR]: {
            on: {
                [TestMachineAction.RESET]: TestMachineState.START
            }
        }
    }
};

export const INITIAL_STATE: TestComponentState = {
    items: [],
    cnt: 0
};
```
