import { assign } from 'xstate/lib/actions';
import { StateMachineOnEntryAction } from 'src/lib';
import { fetchData } from '../services/test-service';
import { TestComponentState } from '../types/test-types';

// https://statecharts.github.io/xstate-viz/

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
    NONE: 'NONE',
    SELECT: 'SELECT',
    EXIT: 'EXIT'
}

export const STATE_CHART = {
    id: 'test',
    initial: MachineState.START,
    states: {
        [MachineState.START]: {
            on: {
                [MachineAction.SUBMIT]: {
                    target: MachineState.PROCESSING,
                    cond: (ctx: TestComponentState) => {
                        return ctx.items.length === 0;
                    }
                }
            },
            onEntry: assign({
                items: []
            })
        },
        [MachineState.PROCESSING]: {
            invoke: {
                src: (ctx: TestComponentState, e: StateMachineOnEntryAction<TestComponentState>) => fetchData(e),
                onDone: {
                    target: MachineState.LIST,
                    actions: assign({
                        items: (ctx: TestComponentState, event: StateMachineOnEntryAction<TestComponentState>) => {
                            return event.data.items;
                        }
                    })
                },
                onError: {
                    target: MachineState.ERROR
                    // error: (ctx, event) => event.data
                }
            }
        },
        [MachineState.LIST]: {
            on: {
                [MachineAction.RESET]: MachineState.START,
                [MachineAction.SELECT]: MachineState.SHOW_ITEM
            }
        },
        [MachineState.SHOW_ITEM]: {
            on: {
                [MachineAction.EXIT]: MachineState.LIST
            }
        },
        [MachineState.ERROR]: {
            on: {
                [MachineAction.RESET]: MachineState.START
            }
        }
    }
};



export const MACHINE_OPTIONS = {
}


export const INITIAL_STATE: TestComponentState = {
    items: []
};
