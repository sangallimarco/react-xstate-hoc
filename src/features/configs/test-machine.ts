import { assign, log } from 'xstate/lib/actions';
import { fetchData } from '../services/test-service';
import { TestComponentState } from './test-types';
import { MachineConfig } from 'xstate';
import { StateMachineAction } from '../../lib';

// https://statecharts.github.io/xstate-viz/

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

type EventType = StateMachineAction<TestComponentState>;

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
                src: (ctx: TestComponentState, e: EventType) => fetchData(e),
                onDone: {
                    target: TestMachineState.LIST,
                    actions: assign({
                        items: (ctx: TestComponentState, e: EventType) => {
                            return e.data.items;
                        }
                    })
                },
                onError: {
                    target: TestMachineState.ERROR,
                    actions: log((ctx: TestComponentState, e: EventType) => e.data)
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



export const MACHINE_OPTIONS = {
}


export const INITIAL_STATE: TestComponentState = {
    items: [],
    cnt: 0
};
