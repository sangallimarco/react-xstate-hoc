import { omit } from 'lodash';
import { fakeAJAX } from '../mocks/ajax';
import { assign } from 'xstate/lib/actions';
// import { MachineConfig, StateSchema } from 'xstate';
import { StateMachineOnEntryAction } from 'src/lib';

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

export interface TestComponentState {
    items: string[];
}

// @TODO fix those
const fetchData = async (e: StateMachineOnEntryAction<TestComponentState>) => {
    const params = omit(e, 'type');
    let items: string[] = [];
    try {
        items = await fakeAJAX(params);
        return { items };
    } catch (e) {
        throw new Error('Something Wrong');
    }
}

export const MACHINE_OPTIONS = {
}


export const INITIAL_STATE: TestComponentState = {
    items: []
};
