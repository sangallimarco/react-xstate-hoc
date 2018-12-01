import { assign } from 'xstate/lib/actions';
import { StateMachineAction } from 'src/lib';
import { fetchData } from '../services/test-service';
import { TestComponentState } from '../types/test-types';
import { MachineConfig } from 'xstate';

// https://statecharts.github.io/xstate-viz/

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
