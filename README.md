## React Xstate HOC
Integrates the Xstate lib with Reactjs. Please follow this link for more details about Xstate https://xstate.js.org/docs/

## Example
Please find the example here https://github.com/sangallimarco/react-xstate-hoc/tree/master/src/features


### HOW TO

Define your State Machine

```typescript
// file: configs/test-machine.ts

import { StateMachineAction } from 'react-xstate-hoc';
import { assign } from 'xstate/lib/actions';
import { fetchData } from '../services/test-service'; // described here below
import { MachineConfig } from 'xstate';

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
                src: (ctx: TestComponentState, e: StateMachineAction<TestComponentState>) => fetchData(e),
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

export const MACHINE_OPTIONS = {
}


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
import { STATE_CHART, MACHINE_OPTIONS, INITIAL_STATE, TestMachineEvents, TestMachineStateSchema, TestComponentState } from '../configs/test-machine';
import './test.css';

interface TestComponentProps extends StateMachineInjectedProps<TestComponentState, TestMachineStateSchema, TestMachineEvents> {
    label?: string;
}

export class TestBaseComponent extends React.PureComponent<TestComponentProps> {

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
    MACHINE_OPTIONS,
    INITIAL_STATE
);

```
