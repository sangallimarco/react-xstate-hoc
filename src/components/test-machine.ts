import { Action } from '../state-machine-component';
import { Dictionary } from 'lodash';
import { assign } from 'xstate/lib/actions';

export const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    LIST: 'LIST',
    ERROR: 'ERROR',
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

export interface TestComponentState {
    items: string[];
}

// this can be visualised here: https://musing-rosalind-2ce8e7.netlify.com/
export const STATE_CHART = {
    initial: 'START',
    context: {
        items: []
    },
    states: {
        START: {
            on: {
                SUBMIT: {
                    target: 'PROCESSING',
                    cond: (ctx: TestComponentState) => {
                        return ctx.items.length === 0;
                    }
                },
                RESET: {
                    actions: assign((ctx: TestComponentState, e) => {
                        return { items: [] };
                    })
                }
            }
        },
        PROCESSING: {
            on: {
                PROCESSED: {
                    target: 'LIST',
                    actions: assign((ctx: TestComponentState, e) => {
                        return { items: e.data.items };
                    })
                },
                ERROR: 'ERROR'
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

// test only 
function fakeAJAX(params: Dictionary<string | number | boolean>) {
    return new Promise<string[]>(resolve => setTimeout(() => {
        resolve(['ok', ...Object.keys(params)]);
    }, 1000)
    );
}

// onEnter actions
export const ON_ENTER_STATE_ACTIONS: Action<TestComponentState> = new Map([
    [
        MachineState.PROCESSING,
        async (params: Dictionary<string | number | boolean>) => {
            const res = await fakeAJAX(params);
            return {
                data: { items: res },
                triggerAction: MachineAction.PROCESSED
            };
        }
    ],
    [
        MachineState.START,
        async () => {
            return {
                data: { items: [] },
                triggerAction: MachineAction.RESET
            };
        }
    ]
]);